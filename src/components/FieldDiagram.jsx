import { useEffect, useRef, useState } from 'react';
import { VIEW, HOME, BASES, POLES, FENCE_R, POSITIONS, POSITION_ORDER, lerp } from '../data/field.js';
import { buildPlayPlan, phaseProgress, ease, PHASES, DURATION_MS, BALL_ONLY_MS } from '../lib/playPlan.js';

// Skinned-infield radii, in view units (the 60ft base path is ~88 units). The
// skin has to clear second base and the middle infielders' depth; foul ground
// near the plate is dirt too, out past the backup spots.
const SKIN_R = 152;
const FOUL_SKIN_R = 176;

const RUNNER_OFFSET = {
  '1B': { x: 19, y: 15 },
  '2B': { x: 0, y: -21 },
  '3B': { x: -19, y: 15 },
};

function FieldBackground({ runners = [] }) {
  const infield = `${HOME.x},${HOME.y} ${BASES['1B'].x},${BASES['1B'].y} ${BASES['2B'].x},${BASES['2B'].y} ${BASES['3B'].x},${BASES['3B'].y}`;
  const fair = `M ${POLES.left.x} ${POLES.left.y} A ${FENCE_R} ${FENCE_R} 0 0 1 ${POLES.right.x} ${POLES.right.y} L ${HOME.x} ${HOME.y} Z`;
  return (
    <g>
      <clipPath id="fd-fair">
        <path d={fair} />
      </clipPath>
      {/* foul-ground dirt sits under the grass wedge so only the corners show */}
      <path
        d={`M ${HOME.x - FOUL_SKIN_R} ${HOME.y} a ${FOUL_SKIN_R} ${FOUL_SKIN_R} 0 0 1 ${FOUL_SKIN_R * 2} 0 Z`}
        className="fd-dirt-foul"
      />
      <path d={fair} className="fd-grass" />
      {/* clipped so the dirt stops at the foul lines instead of flooding foul ground */}
      <path
        d={`M ${HOME.x - SKIN_R} ${HOME.y} a ${SKIN_R} ${SKIN_R} 0 0 1 ${SKIN_R * 2} 0 Z`}
        className="fd-dirt"
        clipPath="url(#fd-fair)"
      />
      <polygon points={infield} className="fd-baselines" />
      <line x1={HOME.x} y1={HOME.y} x2={POLES.left.x} y2={POLES.left.y} className="fd-line" />
      <line x1={HOME.x} y1={HOME.y} x2={POLES.right.x} y2={POLES.right.y} className="fd-line" />
      <path
        d={`M ${POLES.left.x} ${POLES.left.y} A ${FENCE_R} ${FENCE_R} 0 0 1 ${POLES.right.x} ${POLES.right.y}`}
        className="fd-fence"
      />
      <circle cx={HOME.x} cy={HOME.y - 62} r={12} className="fd-circle" />
      {Object.entries(BASES).map(([key, b]) =>
        key === 'home' ? (
          <polygon
            key={key}
            points={`${b.x - 6},${b.y - 6} ${b.x + 6},${b.y - 6} ${b.x + 6},${b.y} ${b.x},${b.y + 7} ${b.x - 6},${b.y}`}
            className="fd-base"
          />
        ) : (
          <rect
            key={key}
            x={b.x - 6}
            y={b.y - 6}
            width="12"
            height="12"
            className={`fd-base${runners.includes(key) ? ' is-occupied' : ''}`}
            transform={`rotate(45 ${b.x} ${b.y})`}
          />
        ),
      )}
      {runners.map((base) => {
        // Nudge runners off the bag so they never hide under a fielder's dot.
        const off = RUNNER_OFFSET[base];
        const x = BASES[base].x + off.x;
        const y = BASES[base].y + off.y;
        return (
          <g key={base} className="fd-runner-group">
            <circle cx={x} cy={y} r={13} className="fd-runner-halo" />
            <circle cx={x} cy={y} r={9} className="fd-runner" />
            <text x={x} y={y + 3.2} className="fd-runner-label">
              R
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Arrow({ from, to, progress, className, dashed }) {
  if (progress <= 0) return null;
  const head = lerp(from, to, progress);
  const angle = Math.atan2(head.y - from.y, head.x - from.x);
  const wing = 7;
  const p1 = { x: head.x - wing * Math.cos(angle - 0.45), y: head.y - wing * Math.sin(angle - 0.45) };
  const p2 = { x: head.x - wing * Math.cos(angle + 0.45), y: head.y - wing * Math.sin(angle + 0.45) };
  return (
    <g className={className}>
      <line x1={from.x} y1={from.y} x2={head.x} y2={head.y} strokeDasharray={dashed ? '5 4' : undefined} />
      {progress > 0.12 && <polygon points={`${head.x},${head.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} className="fd-arrowhead" />}
    </g>
  );
}

export default function FieldDiagram({
  scenario,
  herPosition,
  revealed = false,
  playToken = 0,
  onSelectPosition = null,
  runners,
  youTag = 'YOU',
  highlight = [],
}) {
  const [t, setT] = useState(1);
  const frame = useRef(0);

  const plan = scenario ? buildPlayPlan(scenario, herPosition) : null;

  useEffect(() => {
    if (!plan) {
      setT(1);
      return undefined;
    }
    // Before the reveal the diagram still shows the situation: the ball flies
    // out to where it was hit so she can see the play she is reading.
    const duration = revealed ? DURATION_MS : BALL_ONLY_MS;
    const started = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - started) / duration);
      setT(p);
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    setT(0);
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // playToken forces a replay of the same scenario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, playToken, scenario?.id, herPosition]);

  const ballP = ease(revealed ? phaseProgress(t, PHASES.ball) : t);
  const moveP = ease(phaseProgress(t, PHASES.move));
  const throwP = [phaseProgress(t, PHASES.throw1), phaseProgress(t, PHASES.throw2)];
  const jersey = youTag.startsWith('#') ? youTag.slice(1) : null;

  return (
    <svg className="field" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} role="img" aria-label="Field diagram">
      <FieldBackground runners={runners ?? scenario?.runners ?? []} />

      {plan?.advance && (
        <Arrow from={plan.advance.from} to={plan.advance.to} progress={ballP} className="fd-advance" dashed />
      )}

      {plan?.ball && (
        <g className="fd-ball-path">
          <line
            x1={plan.ball.from.x}
            y1={plan.ball.from.y}
            x2={lerp(plan.ball.from, plan.ball.to, ballP).x}
            y2={lerp(plan.ball.from, plan.ball.to, ballP).y}
          />
          <circle
            cx={lerp(plan.ball.from, plan.ball.to, ballP).x}
            cy={lerp(plan.ball.from, plan.ball.to, ballP).y}
            r={6}
            className="fd-ball"
          />
          {ballP >= 1 && <circle cx={plan.ball.to.x} cy={plan.ball.to.y} r={12} className="fd-ball-spot" />}
        </g>
      )}

      {revealed &&
        plan?.movers
          .filter((m) => m.moves)
          .map((m) => (
            <line
              key={`path-${m.key}`}
              className={`fd-move-path${m.isYou ? ' is-you' : ''}`}
              x1={m.from.x}
              y1={m.from.y}
              x2={lerp(m.from, m.to, moveP).x}
              y2={lerp(m.from, m.to, moveP).y}
            />
          ))}

      {revealed &&
        plan?.throws.map((th, i) => (
          <Arrow
            key={`throw-${th.key}-${i}`}
            from={th.from}
            to={th.to}
            progress={throwP[Math.min(th.order, 2) - 1]}
            className={`fd-throw${th.isYou ? ' is-you' : ''}`}
          />
        ))}

      {POSITION_ORDER.map((key) => {
        const base = POSITIONS[key];
        const mover = plan?.movers.find((m) => m.key === key);
        const at = revealed && mover ? lerp(mover.from, mover.to, moveP) : { x: base.x, y: base.y };
        const isYou = key === herPosition;
        const isMine = highlight.includes(key);
        const clickable = Boolean(onSelectPosition);
        return (
          <g
            key={key}
            className={`fd-player${isYou ? ' is-you' : ''}${isMine ? ' is-mine' : ''}${clickable ? ' is-clickable' : ''}`}
            onClick={clickable ? () => onSelectPosition(key) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectPosition(key);
                    }
                  }
                : undefined
            }
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-label={clickable ? `Play ${POSITIONS[key].name}` : undefined}
          >
            {isYou && <circle cx={at.x} cy={at.y} r={17} className="fd-you-glow" />}
            <circle cx={at.x} cy={at.y} r={isYou && jersey ? 12.5 : 11} className="fd-dot" />
            {/* her dot carries her number; everyone else carries their position */}
            <text x={at.x} y={at.y + 3.5} className="fd-dot-label">
              {isYou && jersey ? jersey : key}
            </text>
            {isYou && !jersey && (
              // No number on file: tag her dot instead (above it down by the
              // plate, where the field runs out).
              <text x={at.x} y={at.y > 300 ? at.y - 18 : at.y + 22} className="fd-you-tag">
                YOU
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
