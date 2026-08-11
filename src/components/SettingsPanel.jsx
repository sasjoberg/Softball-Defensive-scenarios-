import { useState } from 'react';
import { SETTING_OPTIONS } from '../lib/coverage.js';
import PositionChips from './PositionChips.jsx';
import TeamColorPicker from './TeamColorPicker.jsx';
import { cleanName, cleanNumber, NAME_MAX } from '../lib/useAthlete.js';

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

export default function SettingsPanel({ settings, athlete, onSaveAthlete, onChange, onClose, onResetStats }) {
  const [name, setName] = useState(athlete?.name || '');
  const [number, setNumber] = useState(athlete?.number || '');
  const positions = athlete?.positions ?? [];
  const color = athlete?.color;

  // Keep the stored athlete in step with the fields as she types.
  const editName = (value) => {
    const next = cleanName(value);
    setName(next);
    onSaveAthlete({ name: next, number, positions, color });
  };
  const editNumber = (value) => {
    const next = cleanNumber(value);
    setNumber(next);
    onSaveAthlete({ name, number: next, positions, color });
  };
  const editPositions = (next) => onSaveAthlete({ name, number, positions: next, color });
  const editColor = (next) => onSaveAthlete({ name, number, positions, color: next });

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Settings</h2>
          <button type="button" className="ghost" onClick={onClose}>
            Done
          </button>
        </div>

        <div className="setting-group">
          <h3>Who's playing</h3>
          <p className="setting-blurb">Saved on this device only.</p>
          <div className="field-row">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => editName(e.target.value)}
                placeholder="First name"
                maxLength={NAME_MAX}
                autoCapitalize="words"
              />
            </label>
            <label className="field">
              <span>Number</span>
              <input
                type="text"
                value={number}
                onChange={(e) => editNumber(e.target.value)}
                placeholder="00"
                inputMode="numeric"
                pattern="[0-9]*"
                className="field-number"
              />
            </label>
          </div>
          <div className="field">
            <span>Team colours</span>
            <TeamColorPicker selected={color} onPick={editColor} />
          </div>
          <div className="field">
            <span>Your spots</span>
            <PositionChips selected={positions} onToggle={editPositions} />
            <p className="field-note">
              Flags them on the position picker. Every position stays playable either way.
            </p>
          </div>
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
