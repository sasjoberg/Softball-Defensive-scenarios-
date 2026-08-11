// Sanity-checks the scenario bank: every job id is real, every job that needs a
// target has one, every spot reference resolves, and every position has reps.
import { SCENARIOS, scenariosForPosition } from '../src/data/scenarios.js';
import { JOB_BY_ID, TARGETS } from '../src/data/jobs.js';
import { POSITION_ORDER, resolveSpot, HOME, FENCE_R } from '../src/data/field.js';
import { resolveScenario } from '../src/lib/coverage.js';
import { buildPlayPlan } from '../src/lib/playPlan.js';

const errors = [];
const ids = new Set();

const check = (cond, msg) => {
  if (!cond) errors.push(msg);
};

for (const scenario of SCENARIOS) {
  const at = `${scenario.id}`;
  check(!ids.has(scenario.id), `${at}: duplicate id`);
  ids.add(scenario.id);
  check([0, 1, 2].includes(scenario.outs), `${at}: bad outs`);
  check(Array.isArray(scenario.runners), `${at}: runners must be an array`);
  check(typeof scenario.prompt === 'string' && scenario.prompt.length > 10, `${at}: missing prompt`);
  check(Boolean(scenario.ball?.spot), `${at}: missing ball spot`);
  if (scenario.count) {
    check(scenario.count.balls >= 0 && scenario.count.balls <= 3, `${at}: bad ball count`);
    check(scenario.count.strikes >= 0 && scenario.count.strikes <= 2, `${at}: bad strike count`);
  }
  if (scenario.ball?.advance) {
    for (const ref of [scenario.ball.advance.from, scenario.ball.advance.to]) {
      try {
        resolveSpot(ref);
      } catch (e) {
        errors.push(`${at}: advance — ${e.message}`);
      }
    }
  }
  try {
    resolveSpot(scenario.ball.spot);
  } catch (e) {
    errors.push(`${at}: ball spot — ${e.message}`);
  }

  for (const [pos, job] of Object.entries(scenario.responsibilities)) {
    const where = `${at}/${pos}`;
    check(POSITION_ORDER.includes(pos), `${where}: unknown position`);
    const def = JOB_BY_ID[job.job];
    check(Boolean(def), `${where}: unknown job "${job.job}"`);
    check(typeof job.why === 'string' && job.why.length > 12, `${where}: missing why`);
    if (def?.needsTarget) {
      const allowed = TARGETS[def.needsTarget].map((t) => t.id);
      check(allowed.includes(job.target), `${where}: bad target "${job.target}" for ${job.job}`);
    } else {
      check(!job.target, `${where}: job ${job.job} should not carry a target`);
    }
    for (const ref of [job.move?.to, job.throw?.to]) {
      if (ref === undefined) continue;
      try {
        check(Boolean(resolveSpot(ref)), `${where}: unresolvable spot`);
      } catch (e) {
        errors.push(`${where}: ${e.message}`);
      }
    }
    check(!(job.move && job.move.to === undefined), `${where}: move declared with no destination`);
    if (job.throw) check([1, 2].includes(job.throw.order), `${where}: throw needs order 1 or 2`);
  }

  // Every scenario must render a play plan under every settings combination.
  for (const relaySide of ['standard', 'swapped']) {
    for (const stealCoverage of ['rh-ss', 'rh-2b', 'ss-always', '2b-always']) {
      const resolved = resolveScenario(scenario, { relaySide, stealCoverage });
      for (const pos of Object.keys(resolved.responsibilities)) {
        check(Boolean(resolved.responsibilities[pos]), `${at}: undefined responsibility for ${pos} under ${relaySide}/${stealCoverage}`);
      }
      try {
        buildPlayPlan(resolved, 'SS');
      } catch (e) {
        errors.push(`${at} (${relaySide}/${stealCoverage}): plan build failed — ${e.message}`);
      }
    }
  }
}

// Batted balls have to land in the park — a spot beyond the fence arc reads as
// a home run on the diagram no matter what the prompt says.
for (const scenario of SCENARIOS) {
  if (scenario.ball.type === 'steal') continue;
  const spot = resolveSpot(scenario.ball.spot);
  const fromHome = Math.hypot(spot.x - HOME.x, spot.y - HOME.y);
  check(fromHome < FENCE_R - 8, `${scenario.id}: ball lands ${Math.round(fromHome)} from home, past the fence at ${FENCE_R}`);
}

// Steal + relay scenarios must define both middle infielders so a swap is total.
for (const scenario of SCENARIOS) {
  if (!(scenario.tags || []).some((t) => t === 'steal' || t === 'relay')) continue;
  check(Boolean(scenario.responsibilities.SS), `${scenario.id}: coverage-dependent scenario needs SS`);
  check(Boolean(scenario.responsibilities['2B']), `${scenario.id}: coverage-dependent scenario needs 2B`);
}

console.log(`Scenarios: ${SCENARIOS.length}`);
for (const pos of POSITION_ORDER) {
  const n = scenariosForPosition(pos).length;
  check(n >= 5, `${pos}: only ${n} scenarios — needs at least 5`);
  console.log(`  ${pos.padEnd(3)} ${n} situations`);
}

const swapped = resolveScenario(
  SCENARIOS.find((s) => s.id === 'S5'),
  { relaySide: 'swapped', stealCoverage: 'rh-ss' },
);
check(swapped.responsibilities['2B'].job === 'cutoff-relay', 'S5 swapped: 2B should take the relay');
check(swapped.responsibilities.SS.job === 'cover-2b', 'S5 swapped: SS should cover 2nd');

const lefty = resolveScenario(
  SCENARIOS.find((s) => s.id === 'S7'),
  { relaySide: 'standard', stealCoverage: 'rh-2b' },
);
check(lefty.responsibilities['2B'].job === 'cover-2b', 'S7 with rh-2b rule: 2B should cover');

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\nBank OK.');
