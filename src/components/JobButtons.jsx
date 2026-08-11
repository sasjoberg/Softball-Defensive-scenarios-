import { JOBS, TARGETS, JOB_BY_ID } from '../data/jobs.js';
import { targetKind, isComplete } from '../lib/grading.js';

export default function JobButtons({ selection, onSelect, onSubmit, disabled }) {
  const kind = selection?.job ? targetKind(selection.job) : null;
  const ready = isComplete(selection);

  return (
    <div className="jobs">
      <p className="jobs-lead">What's your job?</p>
      <div className="job-grid">
        {JOBS.map((job) => (
          <button
            key={job.id}
            type="button"
            disabled={disabled}
            className={`job-btn${selection?.job === job.id ? ' is-active' : ''}`}
            onClick={() => onSelect({ job: job.id, target: null })}
          >
            <span className="job-label">{job.label}</span>
            {job.hint && <span className="job-hint">{job.hint}</span>}
          </button>
        ))}
      </div>

      {kind && (
        <div className="targets">
          <p className="targets-lead">
            {kind === 'throw' ? 'Where does the throw go?' : kind === 'relay' ? 'Relay to where?' : 'Back up what?'}
          </p>
          <div className="target-row">
            {TARGETS[kind].map((target) => (
              <button
                key={target.id}
                type="button"
                disabled={disabled}
                className={`target-btn${selection?.target === target.id ? ' is-active' : ''}`}
                onClick={() => onSelect({ job: selection.job, target: target.id })}
              >
                {target.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="button" className="primary lock-btn" disabled={!ready || disabled} onClick={onSubmit}>
        {ready ? `Lock it in — ${JOB_BY_ID[selection.job].short}` : 'Pick your job'}
      </button>
    </div>
  );
}
