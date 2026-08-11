import { useState } from 'react';
import AppMark from './AppMark.jsx';
import PositionChips from './PositionChips.jsx';
import { cleanName, cleanNumber, NAME_MAX } from '../lib/useAthlete.js';

/** First run: the only place in the app that asks for typing. */
export default function Onboarding({ onDone }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [positions, setPositions] = useState([]);

  return (
    <div className="onboard">
      <AppMark size={72} />
      <h1>Mental Reps</h1>
      <p className="onboard-lead">
        Situational defense, one rep at a time. Tell us who's taking them — it stays on this
        device.
      </p>

      <label className="field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(cleanName(e.target.value))}
          placeholder="First name"
          maxLength={NAME_MAX}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="done"
        />
      </label>

      <label className="field">
        <span>Number</span>
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(cleanNumber(e.target.value))}
          placeholder="00"
          inputMode="numeric"
          pattern="[0-9]*"
          className="field-number"
          enterKeyHint="done"
        />
      </label>

      <div className="field">
        <span>Your spots — optional</span>
        <PositionChips selected={positions} onToggle={setPositions} />
        <p className="field-note">Just flags them on the picker. Every position stays playable.</p>
      </div>

      <button type="button" className="primary" onClick={() => onDone({ name, number, positions })}>
        Let's get to work
      </button>
      <button
        type="button"
        className="ghost"
        onClick={() => onDone({ name: '', number: '', positions: [] })}
      >
        Skip for now
      </button>
    </div>
  );
}
