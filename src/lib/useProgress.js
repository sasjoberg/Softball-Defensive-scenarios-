import { useCallback } from 'react';
import { usePersistentState, todayKey } from './storage.js';

const EMPTY = {
  day: todayKey(),
  repsToday: 0,
  streak: 0,
  bestStreak: 0,
  byPosition: {}, // { SS: { attempts, correct } }
};

export function useProgress() {
  const [stats, setStats, reset] = usePersistentState('softball-reps:progress', EMPTY);

  const record = useCallback(
    (position, correct) => {
      setStats((prev) => {
        const today = todayKey();
        const rolled = prev.day === today ? prev : { ...prev, day: today, repsToday: 0 };
        const prior = rolled.byPosition[position] || { attempts: 0, correct: 0 };
        const streak = correct ? rolled.streak + 1 : 0;
        return {
          ...rolled,
          repsToday: rolled.repsToday + 1,
          streak,
          bestStreak: Math.max(rolled.bestStreak, streak),
          byPosition: {
            ...rolled.byPosition,
            [position]: {
              attempts: prior.attempts + 1,
              correct: prior.correct + (correct ? 1 : 0),
            },
          },
        };
      });
    },
    [setStats],
  );

  const displayed = stats.day === todayKey() ? stats : { ...stats, repsToday: 0 };
  return { stats: displayed, record, reset };
}
