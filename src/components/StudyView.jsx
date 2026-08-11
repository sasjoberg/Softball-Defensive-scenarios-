import { useMemo, useState } from 'react';
import FieldDiagram from './FieldDiagram.jsx';
import SituationCard from './SituationCard.jsx';
import AssignmentList from './AssignmentList.jsx';
import { scenariosForPosition } from '../data/scenarios.js';
import { resolveScenario } from '../lib/coverage.js';
import { describeAnswer } from '../data/jobs.js';

/** The book experience: flip through the pages, no quiz, no score. */
export default function StudyView({ position, settings, onChangePosition }) {
  const pool = useMemo(() => scenariosForPosition(position), [position]);
  const [index, setIndex] = useState(0);
  const [playToken, setPlayToken] = useState(1);
  const [showAll, setShowAll] = useState(true);

  const scenario = resolveScenario(pool[index], settings);
  const answer = scenario.responsibilities[position];

  const go = (delta) => {
    setIndex((i) => (i + delta + pool.length) % pool.length);
    setPlayToken((n) => n + 1);
  };

  return (
    <div className="quiz study">
      <div className="scoreline">
        <span className="score-item">
          Situation <strong>{index + 1}</strong> of <strong>{pool.length}</strong>
        </span>
        <span className="score-item">Study mode — no scoring</span>
      </div>

      <SituationCard scenario={scenario} position={position} />

      <div className="field-wrap">
        <FieldDiagram scenario={scenario} herPosition={position} revealed playToken={playToken} />
        <button type="button" className="ghost replay" onClick={() => setPlayToken((n) => n + 1)}>
          ↻ Replay
        </button>
      </div>

      <div className="feedback is-study">
        <p className="feedback-headline">Your job</p>
        <p className="answer-line">{describeAnswer(answer)}</p>
        <p className="why">{answer.why}</p>

        <button type="button" className="ghost" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Hide the rest of the defense' : 'See the whole defense'}
        </button>
        {showAll && <AssignmentList scenario={scenario} herPosition={position} />}
      </div>

      <div className="pager">
        <button type="button" className="ghost" onClick={() => go(-1)}>
          ← Back
        </button>
        <button type="button" className="primary" onClick={() => go(1)}>
          Next situation →
        </button>
      </div>

      <button type="button" className="ghost switch" onClick={onChangePosition}>
        Switch position
      </button>
    </div>
  );
}
