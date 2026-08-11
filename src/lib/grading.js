import { JOB_BY_ID } from '../data/jobs.js';

export function needsTarget(jobId) {
  return Boolean(JOB_BY_ID[jobId]?.needsTarget);
}

export function targetKind(jobId) {
  return JOB_BY_ID[jobId]?.needsTarget || null;
}

/** True when the selected job (+ target) matches the correct answer. */
export function isCorrect(selection, answer) {
  if (!selection || !answer) return false;
  if (selection.job !== answer.job) return false;
  if (!needsTarget(answer.job)) return true;
  return selection.target === answer.target;
}

/** An answer is only submittable once any required target is chosen. */
export function isComplete(selection) {
  if (!selection?.job) return false;
  return needsTarget(selection.job) ? Boolean(selection.target) : true;
}

export const AFFIRMATIONS = [
  'Locked in!',
  "That's the play!",
  'Yes!',
  'Textbook.',
  'You know your job!',
  'Big time.',
  'Nailed it!',
  'Instincts.',
];

export function randomAffirmation() {
  return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
}
