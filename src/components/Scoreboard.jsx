const BASE_LABEL = { '1B': '1st', '2B': '2nd', '3B': '3rd' };

/**
 * Broadcast-style readout: lit bases, outs, and the count — the same three
 * things a player checks between pitches.
 */
export default function Scoreboard({ runners, outs, count, position }) {
  const on = (base) => (runners.includes(base) ? ' is-on' : '');
  const runnerText = runners.length
    ? `Runners on ${runners.map((r) => BASE_LABEL[r]).join(', ')}`
    : 'Bases empty';

  return (
    <div className="scoreboard" role="group" aria-label={`${runnerText}. ${outs} out. Count ${count.balls} and ${count.strikes}.`}>
      <div className="sb-cell sb-bases">
        <svg viewBox="0 0 46 40" aria-hidden="true">
          <rect className={`sb-bag${on('2B')}`} x="17" y="3" width="12" height="12" rx="1.5" transform="rotate(45 23 9)" />
          <rect className={`sb-bag${on('3B')}`} x="4" y="16" width="12" height="12" rx="1.5" transform="rotate(45 10 22)" />
          <rect className={`sb-bag${on('1B')}`} x="30" y="16" width="12" height="12" rx="1.5" transform="rotate(45 36 22)" />
        </svg>
      </div>

      <div className="sb-cell sb-outs">
        <span className="sb-label">Out</span>
        <span className="sb-dots" aria-hidden="true">
          {[0, 1].map((i) => (
            <i key={i} className={i < outs ? 'is-on' : ''} />
          ))}
        </span>
      </div>

      <div className="sb-cell sb-count">
        <span className="sb-label">Count</span>
        <span className="sb-value">
          {count.balls}–{count.strikes}
        </span>
      </div>

      <div className="sb-cell sb-you">
        <span className="sb-label">You</span>
        <span className="sb-value">{position}</span>
      </div>
    </div>
  );
}
