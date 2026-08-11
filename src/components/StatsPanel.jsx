import { POSITION_ORDER, POSITIONS } from '../data/field.js';

export default function StatsPanel({ stats, onClose }) {
  const tracked = POSITION_ORDER.filter((key) => stats.byPosition[key]?.attempts);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Your reps</h2>
          <button type="button" className="ghost" onClick={onClose}>
            Done
          </button>
        </div>

        <div className="stat-row">
          <div className="stat-tile">
            <strong>{stats.repsToday}</strong>
            <span>reps today</span>
          </div>
          <div className="stat-tile">
            <strong>{stats.streak}</strong>
            <span>current streak</span>
          </div>
          <div className="stat-tile">
            <strong>{stats.bestStreak}</strong>
            <span>best streak</span>
          </div>
        </div>

        <h3 className="sheet-sub">By position</h3>
        {tracked.length === 0 && <p className="setting-blurb">Take some reps and your accuracy shows up here.</p>}
        {tracked.map((key) => {
          const { attempts, correct } = stats.byPosition[key];
          const pct = Math.round((correct / attempts) * 100);
          return (
            <div key={key} className="acc-row">
              <span className="acc-pos">{key}</span>
              <span className="acc-name">{POSITIONS[key].name}</span>
              <div className="acc-bar">
                <div className="acc-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="acc-pct">
                {pct}% <em>({correct}/{attempts})</em>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
