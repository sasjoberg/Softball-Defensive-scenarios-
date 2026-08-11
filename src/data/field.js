// Top-down field geometry. All coordinates live in one SVG viewBox so the
// diagram, the movement lines and the throws all share a single space.

export const VIEW = { w: 400, h: 380 };

export const HOME = { x: 200, y: 330 };
const BASE_D = 62; // half-diagonal of the diamond in view units

export const BASES = {
  home: HOME,
  '1B': { x: HOME.x + BASE_D, y: HOME.y - BASE_D },
  '2B': { x: HOME.x, y: HOME.y - BASE_D * 2 },
  '3B': { x: HOME.x - BASE_D, y: HOME.y - BASE_D },
};

export const FENCE_R = 272;
const POLE_OFF = FENCE_R * Math.SQRT1_2;
export const POLES = {
  left: { x: HOME.x - POLE_OFF, y: HOME.y - POLE_OFF },
  right: { x: HOME.x + POLE_OFF, y: HOME.y - POLE_OFF },
};

// Where each fielder starts the play.
export const POSITIONS = {
  P: { key: 'P', name: 'Pitcher', x: 200, y: 262 },
  C: { key: 'C', name: 'Catcher', x: 200, y: 352 },
  '1B': { key: '1B', name: 'First Base', x: 272, y: 250 },
  '2B': { key: '2B', name: 'Second Base', x: 240, y: 196 },
  '3B': { key: '3B', name: 'Third Base', x: 128, y: 252 },
  SS: { key: 'SS', name: 'Shortstop', x: 160, y: 196 },
  LF: { key: 'LF', name: 'Left Field', x: 95, y: 112 },
  CF: { key: 'CF', name: 'Center Field', x: 200, y: 80 },
  RF: { key: 'RF', name: 'Right Field', x: 305, y: 112 },
};

export const POSITION_ORDER = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
export const HER_POSITIONS = ['2B', 'SS'];

// Named landing spots for batted balls and the standing spots fielders move to.
export const SPOTS = {
  ...BASES,
  mound: { x: 200, y: 268 },
  plate: HOME,

  // batted ball destinations
  'grounder-SS': { x: 158, y: 208 },
  'grounder-2B': { x: 242, y: 208 },
  'grounder-3B': { x: 132, y: 262 },
  'grounder-1B': { x: 268, y: 262 },
  'grounder-P': { x: 200, y: 275 },
  'bunt-1B-line': { x: 238, y: 302 },
  'pop-1B-foul': { x: 302, y: 292 },
  'pop-SS-3B': { x: 142, y: 224 },
  'LF-CF gap': { x: 138, y: 62 },
  'RF-CF gap': { x: 262, y: 62 },
  'shallow RCF': { x: 258, y: 152 },
  'deep LF': { x: 72, y: 70 },
  'single-LF': { x: 108, y: 138 },
  'single-RF': { x: 292, y: 138 },
  'medium-LF': { x: 100, y: 124 },

  // spots fielders back up to
  'backup-1B': { x: 312, y: 300 },
  'backup-2B': { x: 200, y: 158 },
  'backup-3B': { x: 88, y: 300 },
  'backup-home': { x: 200, y: 364 },

  // holding / trailing spots
  'trail-mound': { x: 196, y: 288 },
  'short-right': { x: 250, y: 224 },
  'short-left': { x: 150, y: 224 },
};

export function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * Resolve a spot reference into {x, y}.
 * Accepts: a SPOTS/POSITIONS key, an {x,y} literal, or
 * {between: [refA, refB], t} to sit on the line between two other spots —
 * which is how cutoffs and relays line themselves up.
 */
export function resolveSpot(ref) {
  if (!ref) return null;
  if (typeof ref === 'string') {
    const spot = SPOTS[ref] || POSITIONS[ref];
    if (!spot) throw new Error(`Unknown spot: ${ref}`);
    return { x: spot.x, y: spot.y };
  }
  if (ref.between) {
    const [a, b] = ref.between;
    return lerp(resolveSpot(a), resolveSpot(b), ref.t ?? 0.5);
  }
  return { x: ref.x, y: ref.y };
}

export function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}
