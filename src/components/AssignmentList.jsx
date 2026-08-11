import { POSITION_ORDER, POSITIONS } from '../data/field.js';
import { describeAnswer } from '../data/jobs.js';

/** The rest of the page from the book: what everyone else is doing on this play. */
export default function AssignmentList({ scenario, herPosition }) {
  return (
    <ul className="assignments">
      {POSITION_ORDER.filter((key) => scenario.responsibilities[key]).map((key) => {
        const job = scenario.responsibilities[key];
        return (
          <li key={key} className={key === herPosition ? 'is-you' : ''}>
            <span className="assign-pos" title={POSITIONS[key].name}>
              {key}
            </span>
            <span className="assign-job">{describeAnswer(job)}</span>
          </li>
        );
      })}
    </ul>
  );
}
