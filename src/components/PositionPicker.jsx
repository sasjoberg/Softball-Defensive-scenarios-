import FieldDiagram from './FieldDiagram.jsx';
import { POSITIONS, POSITION_ORDER, HER_POSITIONS } from '../data/field.js';
import { scenariosForPosition } from '../data/scenarios.js';

export default function PositionPicker({ onPick, stats }) {
  return (
    <div className="picker">
      <p className="picker-lead">Tap your position to start getting reps.</p>
      <div className="picker-field">
        <FieldDiagram scenario={null} herPosition={null} onSelectPosition={onPick} runners={[]} />
      </div>

      <div className="picker-list">
        {POSITION_ORDER.map((key) => {
          const mine = HER_POSITIONS.includes(key);
          const record = stats.byPosition[key];
          const pct = record?.attempts ? Math.round((record.correct / record.attempts) * 100) : null;
          return (
            <button
              key={key}
              type="button"
              className={`pos-card${mine ? ' is-mine' : ''}`}
              onClick={() => onPick(key)}
            >
              <span className="pos-abbr">{key}</span>
              <span className="pos-name">{POSITIONS[key].name}</span>
              <span className="pos-meta">
                {mine && <span className="pos-tag">Your spot</span>}
                <span>{scenariosForPosition(key).length} situations</span>
                {pct !== null && <span className="pos-pct">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
