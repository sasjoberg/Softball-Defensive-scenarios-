import { POSITIONS, POSITION_ORDER, resolveSpot, HOME, dist } from '../data/field.js';

// Timeline slices, all in 0..1 of the animation. The ball goes first, the
// defense reacts, then the throws fire in order — same reading order as a
// diagram in the book.
export const PHASES = {
  ball: [0.0, 0.3],
  move: [0.06, 0.58],
  throw1: [0.58, 0.8],
  throw2: [0.8, 1.0],
};

export const DURATION_MS = 3200;

// Pre-reveal, only the batted ball animates — just enough to show the play she
// is reading without giving away anyone's job.
export const BALL_ONLY_MS = 900;

// Two players can legitimately end up on the same square foot — a third baseman
// fielding beside the bag the shortstop is covering — but two dots on top of
// each other is an unreadable diagram. Nudge them apart, holding still whoever
// is on the ball or never moved in the first place.
const MIN_SEP = 21;

function separate(movers, ball) {
  const fixed = new Set(
    movers.filter((m) => !m.moves || (ball && dist(m.to, ball.to) < 3)).map((m) => m.key),
  );

  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < movers.length; i++) {
      for (let j = i + 1; j < movers.length; j++) {
        const a = movers[i];
        const b = movers[j];
        const aFixed = fixed.has(a.key);
        const bFixed = fixed.has(b.key);
        if (aFixed && bFixed) continue;

        let dx = b.to.x - a.to.x;
        let dy = b.to.y - a.to.y;
        let d = Math.hypot(dx, dy);
        if (d >= MIN_SEP) continue;
        if (d < 0.01) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const ux = dx / d;
        const uy = dy / d;
        const push = (MIN_SEP - d) / 2 + 0.5;
        if (aFixed) {
          b.to = { x: b.to.x + ux * push * 2, y: b.to.y + uy * push * 2 };
        } else if (bFixed) {
          a.to = { x: a.to.x - ux * push * 2, y: a.to.y - uy * push * 2 };
        } else {
          a.to = { x: a.to.x - ux * push, y: a.to.y - uy * push };
          b.to = { x: b.to.x + ux * push, y: b.to.y + uy * push };
        }
      }
    }
  }
}

/**
 * Turn a scenario's responsibilities into everything the field diagram needs:
 * the batted ball path, every fielder's movement line, and the throws.
 */
export function buildPlayPlan(scenario, herPosition) {
  const resp = scenario.responsibilities;

  // A steal has no batted ball — what moves before the defense reacts is the
  // runner, so the diagram shows her jump instead of a ball off the bat.
  const isPitch = scenario.ball?.type === 'steal';
  const ballTo = scenario.ball?.spot ? resolveSpot(scenario.ball.spot) : null;
  const ball = ballTo && !isPitch ? { from: { ...HOME }, to: ballTo, type: scenario.ball.type } : null;
  const advance = scenario.ball?.advance
    ? { from: resolveSpot(scenario.ball.advance.from), to: resolveSpot(scenario.ball.advance.to) }
    : null;

  const movers = POSITION_ORDER.map((key) => {
    const start = { x: POSITIONS[key].x, y: POSITIONS[key].y };
    const job = resp[key];
    const target = job?.move?.to ? resolveSpot(job.move.to) : null;
    return {
      key,
      from: start,
      to: target || start,
      moves: Boolean(target),
      isYou: key === herPosition,
      hasJob: Boolean(job),
    };
  });

  separate(movers, ball);

  const throws = [];
  for (const key of POSITION_ORDER) {
    const job = resp[key];
    if (!job?.throw) continue;
    const mover = movers.find((m) => m.key === key);
    throws.push({
      key,
      order: job.throw.order || 1,
      from: mover.to,
      to: resolveSpot(job.throw.to),
      isYou: key === herPosition,
    });
  }
  throws.sort((a, b) => a.order - b.order);

  return { ball, advance, movers, throws };
}

/** Progress of one phase at time t, clamped to 0..1. */
export function phaseProgress(t, [start, end]) {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return (t - start) / (end - start);
}

// A touch of ease so the dots do not start and stop like robots.
export function ease(p) {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}
