import { SETTING_OPTIONS } from '../lib/coverage.js';

function Group({ title, blurb, name, value, onChange }) {
  return (
    <div className="setting-group">
      <h3>{title}</h3>
      <p className="setting-blurb">{blurb}</p>
      {SETTING_OPTIONS[name].map((option) => (
        <button
          key={option.id}
          type="button"
          className={`option${value === option.id ? ' is-active' : ''}`}
          onClick={() => onChange(name, option.id)}
        >
          <span className="option-radio" aria-hidden="true" />
          <span>
            {option.label}
            {option.note && <em className="option-note">{option.note}</em>}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function SettingsPanel({ settings, onChange, onClose, onResetStats }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Team coverage</h2>
          <button type="button" className="ghost" onClick={onClose}>
            Done
          </button>
        </div>
        <p className="sheet-lead">
          Coverage systems vary. Match these to what your team actually plays and every answer in the app follows.
        </p>

        <Group
          title="Relay on deep balls"
          blurb="Which middle infielder sprints out as the relay."
          name="relaySide"
          value={settings.relaySide}
          onChange={onChange}
        />
        <Group
          title="Steal coverage"
          blurb="Who takes the throw at 2nd on a straight steal."
          name="stealCoverage"
          value={settings.stealCoverage}
          onChange={onChange}
        />

        <button type="button" className="ghost danger" onClick={onResetStats}>
          Reset my progress
        </button>
      </div>
    </div>
  );
}
