import { useCallback, useMemo, useState } from 'react';
import FieldDiagram from './FieldDiagram.jsx';
import JobButtons from './JobButtons.jsx';
import SituationCard from './SituationCard.jsx';
import AssignmentList from './AssignmentList.jsx';
import { scenariosForPosition } from '../data/scenarios.js';
import { resolveScenario } from '../lib/coverage.js';
import { describeAnswer } from '../data/jobs.js';
import { isCorrect, randomAffirmation } from '../lib/grading.js';
import { drawCount } from '../lib/count.js';
import { jerseyTag } from '../lib/useAthlete.js';

function drawScenario(pool, avoidId) {
  const options = pool.length > 1 ? pool.filter((s) => s.id !== avoidId) : pool;
  return options[Math.floor(Math.random() * options.length)];
}

export default function QuizView({ position, settings, stats, athlete, onRecord, onChangePosition }) {
  const pool = useMemo(() => scenariosForPosition(position), [position]);
  const [raw, setRaw] = useState(() => drawScenario(pool, null));
  const [selection, setSelection] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState('ask'); // ask | retry | correct | reveal
  const [affirmation, setAffirmation] = useState('');
  const [playToken, setPlayToken] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const scenario = useMemo(() => resolveScenario(raw, settings), [raw, settings]);
  const count = useMemo(() => drawCount(raw), [raw]);
  const answer = scenario.responsibilities[position];

  const nextRep = useCallback(() => {
    setRaw((prev) => drawScenario(pool, prev?.id));
    setSelection(null);
    setAttempts(0);
    setPhase('ask');
    setShowAll(false);
  }, [pool]);

  const submit = () => {
    const correct = isCorrect(selection, answer);
    if (attempts === 0) onRecord(position, correct);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (correct) {
      setAffirmation(randomAffirmation(athlete?.name));
      setPhase('correct');
      setPlayToken((n) => n + 1);
    } else if (nextAttempts >= 2) {
      setPhase('reveal');
      setPlayToken((n) => n + 1);
    } else {
      setPhase('retry');
      setSelection(null);
    }
  };

  const showMe = () => {
    if (attempts === 0) onRecord(position, false);
    setAttempts((n) => Math.max(n, 1));
    setPhase('reveal');
    setPlayToken((n) => n + 1);
  };

  const revealed = phase === 'correct' || phase === 'reveal';

  return (
    <div className="quiz">
      <div className="scoreline">
        <span className="score-item">
          <strong>{stats.repsToday}</strong> reps today
        </span>
        <span className={`score-item${stats.streak > 0 ? ' is-hot' : ''}`}>
          <strong>{stats.streak}</strong> streak
        </span>
        <span className="score-item">
          <strong>{stats.bestStreak}</strong> best
        </span>
      </div>

      <SituationCard scenario={scenario} position={position} count={count} />

      <div className="field-wrap">
        <FieldDiagram
          scenario={scenario}
          herPosition={position}
          revealed={revealed}
          playToken={playToken}
          youTag={jerseyTag(athlete)}
        />
        {revealed && (
          <button type="button" className="ghost replay" onClick={() => setPlayToken((n) => n + 1)}>
            ↻ Replay
          </button>
        )}
      </div>

      {phase === 'ask' && (
        <JobButtons selection={selection} onSelect={setSelection} onSubmit={submit} />
      )}

      {phase === 'retry' && (
        <div className="feedback is-retry">
          <p className="feedback-headline">Not quite — try again.</p>
          <p className="feedback-sub">You've got another look. Read the runners.</p>
          <JobButtons selection={selection} onSelect={setSelection} onSubmit={submit} />
          <button type="button" className="ghost" onClick={showMe}>
            Show me the play
          </button>
        </div>
      )}

      {phase === 'ask' && (
        <button type="button" className="ghost" onClick={showMe}>
          Show me the play
        </button>
      )}

      {revealed && (
        <div className={`feedback ${phase === 'correct' ? 'is-correct' : 'is-reveal'}`}>
          {phase === 'correct' ? (
            <>
              <div className="star" aria-hidden="true">
                ★
              </div>
              <p className="feedback-headline">{affirmation}</p>
            </>
          ) : (
            <p className="feedback-headline">Here's the play.</p>
          )}
          <p className="answer-line">{describeAnswer(answer)}</p>
          <p className="why">{answer.why}</p>

          <button type="button" className="ghost" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Hide the rest of the defense' : 'See the whole defense'}
          </button>
          {showAll && <AssignmentList scenario={scenario} herPosition={position} />}

          <button type="button" className="primary" onClick={nextRep}>
            Next rep →
          </button>
        </div>
      )}

      <button type="button" className="ghost switch" onClick={onChangePosition}>
        Switch position
      </button>
    </div>
  );
}
