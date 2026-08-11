import { useState } from 'react';
import DiamondMark from './components/DiamondMark.jsx';
import Onboarding from './components/Onboarding.jsx';
import PositionPicker from './components/PositionPicker.jsx';
import QuizView from './components/QuizView.jsx';
import StudyView from './components/StudyView.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import SharePanel from './components/SharePanel.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import { usePersistentState } from './lib/storage.js';
import { useProgress } from './lib/useProgress.js';
import { useAthlete, possessive } from './lib/useAthlete.js';
import { DEFAULT_SETTINGS } from './lib/coverage.js';
import { POSITIONS } from './data/field.js';

export default function App() {
  const [position, setPosition] = useState(null);
  const [mode, setMode] = useState('quiz');
  const [settings, setSettings] = usePersistentState('softball-reps:settings', DEFAULT_SETTINGS);
  const [sheet, setSheet] = useState(null);
  const { stats, record, reset } = useProgress();
  const { athlete, save } = useAthlete();

  const changeSetting = (name, value) => setSettings((prev) => ({ ...prev, [name]: value }));

  if (!athlete.onboarded) {
    return (
      <div className="app">
        <Onboarding onDone={save} />
      </div>
    );
  }

  const title = athlete.name ? `${possessive(athlete.name)} Reps` : 'Mental Reps';
  const subtitle = position
    ? [POSITIONS[position].name, athlete.number && `#${athlete.number}`].filter(Boolean).join(' · ')
    : 'Know your job before the pitch';

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setPosition(null)}>
          <DiamondMark />
          <span>
            <strong>{title}</strong>
            <em>{subtitle}</em>
          </span>
        </button>
        <div className="topbar-actions">
          <button type="button" className="icon-btn" onClick={() => setSheet('share')} aria-label="Share">
            🔗
          </button>
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
        {!position && <PositionPicker onPick={setPosition} stats={stats} athlete={athlete} />}
        {position && mode === 'quiz' && (
          <QuizView
            key={`quiz-${position}`}
            position={position}
            settings={settings}
            stats={stats}
            athlete={athlete}
            onRecord={record}
            onChangePosition={() => setPosition(null)}
          />
        )}
        {position && mode === 'study' && (
          <StudyView
            key={`study-${position}`}
            position={position}
            settings={settings}
            athlete={athlete}
            onChangePosition={() => setPosition(null)}
          />
        )}
      </main>

      {sheet === 'settings' && (
        <SettingsPanel
          settings={settings}
          athlete={athlete}
          onSaveAthlete={save}
          onChange={changeSetting}
          onClose={() => setSheet(null)}
          onResetStats={() => {
            reset();
            setSheet(null);
          }}
        />
      )}
      {sheet === 'stats' && <StatsPanel stats={stats} athlete={athlete} onClose={() => setSheet(null)} />}
      {sheet === 'share' && <SharePanel title={title} onClose={() => setSheet(null)} />}
    </div>
  );
}
