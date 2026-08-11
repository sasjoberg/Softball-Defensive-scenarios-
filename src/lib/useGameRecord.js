import { useCallback } from 'react';
import { usePersistentState } from './storage.js';

export const OUTS_PER_GAME = 21; // seven innings

const EMPTY = { best: null, games: 0 }; // best: { ms, errors, position, date }

/** Fastest completed game on this device. */
export function useGameRecord() {
  const [record, setRecord] = usePersistentState('softball-reps:game', EMPTY);

  // Decide from the value we already hold — a state updater runs later, so
  // reading the answer out of it would always come back false.
  const finish = useCallback(
    (result) => {
      const beatIt = !record.best || result.ms < record.best.ms;
      setRecord((prev) => ({
        games: (prev.games || 0) + 1,
        best: !prev.best || result.ms < prev.best.ms ? result : prev.best,
      }));
      return beatIt;
    },
    [record, setRecord],
  );

  return { record, finish };
}

export function formatClock(ms) {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const tenths = Math.floor((total % 1000) / 100);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

/** Outs → which inning she is in, and how many outs are down in it. */
export function inningFromOuts(outs) {
  return { inning: Math.min(7, Math.floor(outs / 3) + 1), outsInInning: outs % 3 };
}
