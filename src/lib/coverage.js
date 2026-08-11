// Coverage systems vary team to team. The seed bank is written in the most
// common convention; these settings re-map it to whatever a team actually runs.

export const DEFAULT_SETTINGS = {
  // Which middle infielder goes out as the relay on a deep ball.
  relaySide: 'standard', // 'standard' = SS relays left/left-center, 2B relays right/right-center
  // Who covers second on a steal.
  stealCoverage: 'rh-ss', // right-handed batter -> SS covers
};

export const SETTING_OPTIONS = {
  relaySide: [
    { id: 'standard', label: 'SS relays left side, 2B relays right side', note: 'Most common' },
    { id: 'swapped', label: 'SS relays right side, 2B relays left side' },
  ],
  stealCoverage: [
    { id: 'rh-ss', label: 'Righty at the plate → SS covers 2nd', note: 'Most common' },
    { id: 'rh-2b', label: 'Righty at the plate → 2B covers 2nd' },
    { id: 'ss-always', label: 'Shortstop always covers 2nd' },
    { id: '2b-always', label: 'Second baseman always covers 2nd' },
  ],
};

/** Which middle infielder covers second on a steal, per the team's rule. */
export function stealCoverer(rule, batterHand) {
  switch (rule) {
    case 'ss-always':
      return 'SS';
    case '2b-always':
      return '2B';
    case 'rh-2b':
      return batterHand === 'R' ? '2B' : 'SS';
    case 'rh-ss':
    default:
      return batterHand === 'R' ? 'SS' : '2B';
  }
}

function swapMiddleInfielders(responsibilities) {
  const next = { ...responsibilities };
  next.SS = responsibilities['2B'];
  next['2B'] = responsibilities.SS;
  return next;
}

/**
 * Apply the team's coverage settings to a scenario. The bank stores the common
 * convention; anything that depends on a team rule gets remapped here so the
 * quiz grades against what this team actually plays.
 */
export function resolveScenario(scenario, settings = DEFAULT_SETTINGS) {
  const tags = scenario.tags || [];
  let responsibilities = scenario.responsibilities;

  if (tags.includes('relay') && settings.relaySide === 'swapped') {
    responsibilities = swapMiddleInfielders(responsibilities);
  }

  if (tags.includes('steal')) {
    // The bank always writes SS as the coverer; flip if this team's rule differs.
    const coverer = stealCoverer(settings.stealCoverage, scenario.batterHand);
    if (coverer !== 'SS') responsibilities = swapMiddleInfielders(responsibilities);
  }

  return responsibilities === scenario.responsibilities ? scenario : { ...scenario, responsibilities };
}
