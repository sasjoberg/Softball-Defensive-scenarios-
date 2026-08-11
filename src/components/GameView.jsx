import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FieldDiagram from './FieldDiagram.jsx';
import JobButtons from './JobButtons.jsx';
import SituationCard from './SituationCard.jsx';
import { scenariosForPosition } from '../data/scenarios.js';
import { resolveScenario } from '../lib/coverage.js';
import { describeAnswer } from '../data/jobs.js';
import { isCorrect } from '../lib/grading.js';
import { drawCount } from '../lib/count.js';
import { jerseyTag } from '../lib/useAthlete.js';
import { OUTS_PER_GAME, formatClock, inningFromOuts, useGameRecord } from '../lib/useGameRecord.js';

function drawScenario(pool, avoidId) {
  const options = pool.length > 1 ? pool.filter((s) => s.id !== avoidId) : pool;
  return options[Math.floor(Math.random() * options.length)];
}

/** Live clock, kept out of the main component so it re-renders on its own. */
function Clock({ startedAt, frozenMs }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (frozenMs != null) return undefined;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [frozenMs]);
  return <span className="clock">{formatClock(frozenMs ?? now - startedAt)}</span>;
}

export default function GameView({ position, settings, athlete, onRecord, onChangePosition }) {
  const pool = useMemo(() => scenariosForPosition(position), [position]);
  const { record, finish } = useGameRecord();

  const [phase, setPhase] = useState('ready'); // ready | playing | done
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(null);
  const [outs, setOuts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [cleanOuts, setCleanOuts] = useState(0); // batters retired on the first answer
  const [misses, setMisses] = useState(0); // misses on the current batter
  const [flash, setFlash] = useState(null); // 'out' | 'safe'
  const [raw, setRaw] = useState(() => drawScenario(pool, null));
  const [selection, setSelection] = useState(null);
  const [isBest, setIsBest] = useState(false);
  const advancing = useRef(null);

  const scenario = useMemo(() => resolveScenario(raw, settings), [raw, settings]);
  const count = useMemo(() => drawCount(raw), [raw]);
  const answer = scenario.responsibilities[position];
  const { inning } = inningFromOuts(outs);

  useEffect(() => () => clearTimeout(advancing.current), []);

  const start = () => {
    setOuts(0);
    setErrors(0);
    setCleanOuts(0);
    setMisses(0);
    setSelection(null);
    setFlash(null);
    setElapsed(null);
    setIsBest(false);
    setRaw(drawScenario(pool, null));
    setStartedAt(Date.now());
    setPhase('playing');
  };

  const nextBatter = useCallback(() => {
    setRaw((prev) => drawScenario(pool, prev?.id));
    setSelection(null);
    setMisses(0);
    setFlash(null);
  }, [pool]);

  const submit = () => {
    const correct = isCorrect(selection, answer);
    if (misses === 0) onRecord(position, correct);

    if (!correct) {
      setErrors((n) => n + 1);
      setMisses((n) => n + 1);
      setSelection(null);
      setFlash('safe');
      setTimeout(() => setFlash(null), 700);
      return;
    }

    const next = outs + 1;
    setOuts(next);
    if (misses === 0) setCleanOuts((n) => n + 1);
    setFlash('out');

    if (next >= OUTS_PER_GAME) {
      const ms = Date.now() - startedAt;
      setElapsed(ms);
      const clean = cleanOuts + (misses === 0 ? 1 : 0);
      setIsBest(finish({ ms, errors, clean, position, date: new Date().toISOString().slice(0, 10) }));
      setPhase('done');
      return;
    }
    advancing.current = setTimeout(nextBatter, 650);
  };

  if (phase === 'ready') {
    return (
      <div className="quiz game">
        <div className="game-intro">
          <h2>21 Outs</h2>
          <p>
            Seven innings, three outs an inning. Every batter is a rep — call your job right and
            that is an out. Miss it and she is safe: the clock keeps running until you get it.
          </p>
          <div className="stat-row">
            <div className="stat-tile">
              <strong>{OUTS_PER_GAME}</strong>
              <span>outs to record</span>
            </div>
            <div className="stat-tile">
              <strong>{record.best ? formatClock(record.best.ms) : '—'}</strong>
              <span>best time</span>
            </div>
            <div className="stat-tile">
              <strong>{record.best ? record.best.errors : '—'}</strong>
              <span>errors that game</span>
            </div>
          </div>
          <button type="button" className="primary" onClick={start}>
            Play ball →
          </button>
          <button type="button" className="ghost switch" onClick={onChangePosition}>
            Switch position
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="quiz game">
        <div className="game-intro">
          <div className="star" aria-hidden="true">
            ★
          </div>
          <h2>{isBest ? 'New best!' : 'Game over'}</h2>
          <p>
            21 outs in <strong className="clock">{formatClock(elapsed)}</strong> with{' '}
            <strong>{errors}</strong> {errors === 1 ? 'error' : 'errors'}.
          </p>
          <div className="stat-row">
            <div className="stat-tile">
              <strong className="clock">{formatClock(elapsed)}</strong>
              <span>your time</span>
            </div>
            <div className="stat-tile">
              <strong>{Math.round((cleanOuts / OUTS_PER_GAME) * 100)}%</strong>
              <span>clean on first look</span>
            </div>
            <div className="stat-tile">
              <strong className="clock">{record.best ? formatClock(record.best.ms) : '—'}</strong>
              <span>best time</span>
            </div>
          </div>
          <button type="button" className="primary" onClick={start}>
            Play again
          </button>
          <button type="button" className="ghost switch" onClick={onChangePosition}>
            Switch position
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz game">
      <div className="gameline">
        <span className="game-item">
          <span className="game-label">Inning</span>
          <strong>{inning}</strong>
        </span>
        <span className="game-item">
          {/* "Recorded", not "Outs" — the scoreboard below shows the situation's outs */}
          <span className="game-label">Recorded</span>
          <strong>
            {outs}
            <em>/{OUTS_PER_GAME}</em>
          </strong>
        </span>
        <span className="game-item">
          <span className="game-label">Errors</span>
          <strong>{errors}</strong>
        </span>
        <span className="game-item">
          <span className="game-label">Clock</span>
          <Clock startedAt={startedAt} frozenMs={null} />
        </span>
      </div>

      <div
        className="game-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={OUTS_PER_GAME}
        aria-valuenow={outs}
        aria-label={`${outs} of ${OUTS_PER_GAME} outs recorded`}
      >
        <div style={{ width: `${(outs / OUTS_PER_GAME) * 100}%` }} />
      </div>

      <SituationCard scenario={scenario} position={position} count={count} />

      <div className="field-wrap">
        <FieldDiagram
          scenario={scenario}
          herPosition={position}
          revealed={false}
          playToken={raw.id}
          youTag={jerseyTag(athlete)}
        />
        {flash && (
          <div className={`flash is-${flash}`} role="status">
            {flash === 'out' ? 'OUT!' : 'Safe — go again'}
          </div>
        )}
      </div>

      {misses >= 2 && (
        <p className="game-hint">
          Answer: <strong>{describeAnswer(answer)}</strong>
        </p>
      )}

      <JobButtons selection={selection} onSelect={setSelection} onSubmit={submit} disabled={flash === 'out'} />
    </div>
  );
}
