import { useState } from 'react';
import PositionPicker from './components/PositionPicker.jsx';
import QuizView from './components/QuizView.jsx';
import StudyView from './components/StudyView.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import { usePersistentState } from './lib/storage.js';
import { useProgress } from './lib/useProgress.js';
import { DEFAULT_SETTINGS } from './lib/coverage.js';
import { POSITIONS } from './data/field.js';

export default function App() {
  const [position, setPosition] = useState(null);
  const [mode, setMode] = useState('quiz');
  const [settings, setSettings] = usePersistentState('softball-reps:settings', DEFAULT_SETTINGS);
  const [sheet, setSheet] = useState(null);
  const { stats, record, reset } = useProgress();

  const changeSetting = (name, value) => setSettings((prev) => ({ ...prev, [name]: value }));

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setPosition(null)}>
          <span className="brand-mark">⚾</span>
          <span>
            <strong>Mental Reps</strong>
            <em>{position ? POSITIONS[position].name : 'Know your job before the pitch'}</em>
          </span>
        </button>
        <div className="topbar-actions">
          <button type="button" className="icon-btn" onClick={() => setSheet('stats')} aria-label="Progress">
            📊
          </button>
          <button type="button" className="icon-btn" onClick={() => setSheet('settings')} aria-label="Settings">
            ⚙️
          </button>
        </div>
      </header>

      <div className="mode-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'quiz'}
          className={mode === 'quiz' ? 'is-active' : ''}
          onClick={() => setMode('quiz')}
        >
          Quiz
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'study'}
          className={mode === 'study' ? 'is-active' : ''}
          onClick={() => setMode('study')}
        >
          Study
        </button>
      </div>

      <main>
        {!position && <PositionPicker onPick={setPosition} stats={stats} />}
        {position && mode === 'quiz' && (
          <QuizView
            key={`quiz-${position}`}
            position={position}
            settings={settings}
            stats={stats}
            onRecord={record}
            onChangePosition={() => setPosition(null)}
          />
        )}
        {position && mode === 'study' && (
          <StudyView
            key={`study-${position}`}
            position={position}
            settings={settings}
            onChangePosition={() => setPosition(null)}
          />
        )}
      </main>

      {sheet === 'settings' && (
        <SettingsPanel
          settings={settings}
          onChange={changeSetting}
          onClose={() => setSheet(null)}
          onResetStats={() => {
            reset();
            setSheet(null);
          }}
        />
      )}
      {sheet === 'stats' && <StatsPanel stats={stats} onClose={() => setSheet(null)} />}
    </div>
  );
}
