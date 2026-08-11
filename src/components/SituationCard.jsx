const BASE_LABEL = { '1B': '1st', '2B': '2nd', '3B': '3rd' };

function runnersText(runners) {
  if (!runners.length) return 'Bases empty';
  if (runners.length === 3) return 'Bases loaded';
  return `Runners on ${runners.map((r) => BASE_LABEL[r]).join(' and ')}`;
}

export default function SituationCard({ scenario, position }) {
  const outs = scenario.outs === 1 ? '1 out' : `${scenario.outs} outs`;
  const runners = scenario.runners.length === 1
    ? `Runner on ${BASE_LABEL[scenario.runners[0]]}`
    : runnersText(scenario.runners);

  return (
    <div className="situation">
      <div className="situation-chips">
        <span className="chip">{outs}</span>
        <span className="chip">{runners}</span>
        <span className="chip chip-you">You: {position}</span>
      </div>
      <p className="situation-prompt">{scenario.prompt}</p>
    </div>
  );
}
