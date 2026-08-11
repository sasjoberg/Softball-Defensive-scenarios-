import FieldDiagram from './FieldDiagram.jsx';
import { POSITIONS, POSITION_ORDER } from '../data/field.js';
import { scenariosForPosition } from '../data/scenarios.js';

export default function PositionPicker({ onPick, stats, athlete }) {
  const mySpots = athlete?.positions ?? [];

  return (
    <div className="picker">
      <p className="picker-lead">
        {athlete?.name ? `Tap your position, ${athlete.name}.` : 'Tap your position to start getting reps.'}
      </p>
      <p className="picker-sub">
        {mySpots.length
          ? 'All nine are open — tap any spot to learn it.'
          : 'Any of the nine. Set your own spots in settings to flag them here.'}
      </p>
      <div className="picker-field">
        <FieldDiagram
          scenario={null}
          herPosition={null}
          onSelectPosition={onPick}
          runners={[]}
          highlight={mySpots}
        />
      </div>

      <div className="picker-list">
        {POSITION_ORDER.map((key) => {
          const mine = mySpots.includes(key);
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
