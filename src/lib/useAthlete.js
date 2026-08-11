import { usePersistentState } from './storage.js';

// Who is holding the phone. Stored on this device only — a teammate who opens
// the shared link gets her own first-run screen and her own progress.
export const EMPTY_ATHLETE = { name: '', number: '', onboarded: false };

export const NAME_MAX = 20;
export const NUMBER_MAX = 3;

export function cleanName(value) {
  return value.replace(/\s+/g, ' ').trimStart().slice(0, NAME_MAX);
}

export function cleanNumber(value) {
  return value.replace(/\D/g, '').slice(0, NUMBER_MAX);
}

export function useAthlete() {
  const [athlete, setAthlete] = usePersistentState('softball-reps:athlete', EMPTY_ATHLETE);

  const save = (next) =>
    setAthlete({
      name: cleanName(next.name || '').trim(),
      number: cleanNumber(next.number || ''),
      onboarded: true,
    });

  return { athlete, setAthlete, save };
}

/** "Maggie" → "Maggie's". Handles names already ending in s. */
export function possessive(name) {
  if (!name) return '';
  return name.endsWith('s') || name.endsWith('S') ? `${name}'` : `${name}'s`;
}

/** What to print on her dot in the diagram. */
export function jerseyTag(athlete) {
  return athlete.number ? `#${athlete.number}` : 'YOU';
}
