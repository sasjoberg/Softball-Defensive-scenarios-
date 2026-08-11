import { useCallback, useEffect, useState } from 'react';

// localStorage-backed state that degrades to plain in-memory state wherever
// storage is unavailable (private windows, sandboxed embeds).
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — session-only is fine */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset];
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
