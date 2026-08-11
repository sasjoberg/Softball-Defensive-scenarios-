// The full button vocabulary. Every rep is answered from this same set so the
// buttons build muscle memory instead of hinting at the answer.

export const JOBS = [
  { id: 'field', label: 'Field the ball', short: 'Field it', needsTarget: 'throw' },
  { id: 'cover-1b', label: 'Cover 1st', short: 'Cover 1st', base: '1B' },
  { id: 'cover-2b', label: 'Cover 2nd', short: 'Cover 2nd', base: '2B' },
  { id: 'cover-3b', label: 'Cover 3rd', short: 'Cover 3rd', base: '3B' },
  { id: 'cover-home', label: 'Cover Home', short: 'Cover home', base: 'home' },
  { id: 'cutoff-relay', label: 'Cutoff / Relay', short: 'Cutoff / relay', needsTarget: 'relay' },
  { id: 'backup', label: 'Back up', short: 'Back up', needsTarget: 'backup' },
  { id: 'communicate', label: 'Communicate', short: 'Communicate', hint: 'talk it up, no direct play' },
];

export const JOB_BY_ID = Object.fromEntries(JOBS.map((j) => [j.id, j]));

export const TARGETS = {
  throw: [
    { id: '1B', label: 'to 1st' },
    { id: '2B', label: 'to 2nd' },
    { id: '3B', label: 'to 3rd' },
    { id: 'home', label: 'to Home' },
    { id: 'hold', label: 'Hold it' },
  ],
  relay: [
    { id: 'home', label: 'to Home' },
    { id: '3B', label: 'to 3rd' },
    { id: '2B', label: 'to 2nd' },
  ],
  backup: [
    { id: '1B', label: '1st' },
    { id: '2B', label: '2nd' },
    { id: '3B', label: '3rd' },
    { id: 'home', label: 'Home' },
    { id: 'ball', label: 'the ball' },
  ],
};

const BASE_WORD = { '1B': '1st', '2B': '2nd', '3B': '3rd', home: 'home', ball: 'the ball', hold: 'hold' };

/** Human-readable version of a job + target pair, e.g. "Field it — throw to 2nd". */
export function describeAnswer(answer) {
  if (!answer) return '';
  if (answer.label) return answer.label;
  const job = JOB_BY_ID[answer.job];
  if (!job) return '';
  switch (job.id) {
    case 'field':
      return answer.target === 'hold'
        ? 'Field it — hold the ball'
        : `Field it — throw to ${BASE_WORD[answer.target]}`;
    case 'cutoff-relay':
      return `Cutoff / relay to ${BASE_WORD[answer.target]}`;
    case 'backup':
      return answer.target === 'ball' ? 'Back up the ball' : `Back up ${BASE_WORD[answer.target]}`;
    case 'communicate':
      return 'Communicate — talk, no direct play';
    default:
      return job.label;
  }
}
