// Ball/strike counts. Most scenarios do not care about the count, but showing
// one makes the situation read like a broadcast graphic. Scenarios where the
// count actually matters (a taken pitch on a steal) declare their own.

const COUNTS = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
  [3, 1],
  [3, 2],
];

function toCount(pair) {
  return { balls: pair[0], strikes: pair[1] };
}

/** A fresh count for a new rep. */
export function drawCount(scenario) {
  if (scenario?.count) return scenario.count;
  return toCount(COUNTS[Math.floor(Math.random() * COUNTS.length)]);
}

/** The same count every time for a given scenario — study mode should not flicker. */
export function stableCount(scenario) {
  if (scenario?.count) return scenario.count;
  let hash = 0;
  for (const ch of scenario.id) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  return toCount(COUNTS[hash % COUNTS.length]);
}
