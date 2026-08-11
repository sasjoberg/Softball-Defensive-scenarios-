import { TEAM_COLORS } from '../data/teamColors.js';

/** Swatch row for the team's colour — retints the whole app. */
export default function TeamColorPicker({ selected, onPick }) {
  return (
    <div className="swatches">
      {TEAM_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`swatch${selected === c.id ? ' is-active' : ''}`}
          style={{ '--swatch': c.accent }}
          aria-label={c.name}
          aria-pressed={selected === c.id}
          title={c.name}
          onClick={() => onPick(c.id)}
        />
      ))}
    </div>
  );
}
