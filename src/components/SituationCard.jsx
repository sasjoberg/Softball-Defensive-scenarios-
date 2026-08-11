import Scoreboard from './Scoreboard.jsx';

export default function SituationCard({ scenario, position, count }) {
  return (
    <div className="situation">
      <Scoreboard runners={scenario.runners} outs={scenario.outs} count={count} position={position} />
      <p className="situation-prompt">{scenario.prompt}</p>
    </div>
  );
}
