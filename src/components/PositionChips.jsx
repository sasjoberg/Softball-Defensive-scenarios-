import { POSITIONS, POSITION_ORDER } from '../data/field.js';

/** Optional multi-select for the spots she actually plays. */
export default function PositionChips({ selected = [], onToggle }) {
  return (
    <div className="chips">
      {POSITION_ORDER.map((key) => {
        const on = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            className={`chip-btn${on ? ' is-active' : ''}`}
            aria-pressed={on}
            aria-label={POSITIONS[key].name}
            onClick={() => onToggle(on ? selected.filter((p) => p !== key) : [...selected, key])}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
