// The verified scenario bank. Each entry is one page of the field guide: a
// game situation plus every position's job, the one-line why, and where that
// player moves on the diagram.
//
// Movement notes:
//   move  - where this player ends up ({to: <spot ref>}); omit if she holds her spot
//   throw - {to: <spot ref>, order: 1|2}; order 2 fires after order 1 (relays)
// Spot refs are keys from data/field.js SPOTS/POSITIONS, an {x,y}, or
// {between:[a,b], t} for cutoffs lining up between the ball and a base.

const cover = (base, why, extra = {}) => ({
  job: base === 'home' ? 'cover-home' : `cover-${base.toLowerCase()}`,
  why,
  move: { to: base },
  ...extra,
});

const field = (target, why, extra = {}) => ({ job: 'field', target, why, ...extra });

const relay = (target, why, extra = {}) => ({ job: 'cutoff-relay', target, why, ...extra });

const backup = (target, why, extra = {}) => ({
  job: 'backup',
  target,
  why,
  move: { to: target === 'ball' ? undefined : `backup-${target}` },
  ...extra,
});

const talk = (why, extra = {}) => ({ job: 'communicate', why, ...extra });

export const SCENARIOS = [
  {
    id: 'S1',
    outs: 0,
    runners: [],
    ball: { type: 'grounder', location: 'shortstop', spot: 'grounder-SS' },
    prompt: 'No outs. Bases empty. Sharp ground ball to the shortstop.',
    responsibilities: {
      SS: field('1B', 'Easy out available — take the sure one at first.', {
        move: { to: 'grounder-SS' },
        throw: { to: '1B', order: 1 },
      }),
      '2B': cover('2B', 'Nobody on, but you still own the bag behind the play.'),
      '1B': cover('1B', 'Get to the bag early and give the shortstop a big target.'),
      '3B': cover('3B', 'Stay home — protect your base in case the ball sneaks through.'),
      P: backup('1B', 'Ball to the left side means you sprint behind first for the overthrow.'),
      C: backup('1B', 'Bases empty — trail the runner down the line and back up first.'),
      LF: backup('ball', 'Charge in behind the shortstop in case it eats her up.', {
        move: { to: { between: ['LF', 'grounder-SS'], t: 0.45 } },
      }),
      CF: backup('ball', 'Break in toward the ball — an infield bobble is still live.', {
        move: { to: { between: ['CF', 'grounder-SS'], t: 0.4 } },
      }),
      RF: backup('1B', 'Every throw to first gets an outfielder behind it. That is you.'),
    },
  },

  {
    id: 'S2',
    outs: 1,
    runners: ['1B'],
    ball: { type: 'grounder', location: 'shortstop', spot: 'grounder-SS' },
    prompt: 'One out. Runner on 1st. Ground ball to the shortstop at double-play depth.',
    responsibilities: {
      SS: field('2B', 'Force is on — get the lead runner first, then the batter.', {
        move: { to: 'grounder-SS' },
        throw: { to: '2B', order: 1 },
      }),
      '2B': cover('2B', 'Take the feed, hit the bag, turn two to first.', {
        throw: { to: '1B', order: 2 },
      }),
      '1B': cover('1B', 'Stretch and give her a target for the back half of the double play.'),
      '3B': cover('3B', 'Hold your base — the play is in front of you.'),
      P: backup('1B', 'Follow the double play down and get behind first.'),
      C: cover('home', 'Runner on base — stay home and protect the plate.'),
      LF: backup('ball', 'Come in hard behind the shortstop in case it gets through.', {
        move: { to: { between: ['LF', 'grounder-SS'], t: 0.45 } },
      }),
      CF: backup('2B', 'The throw is going to second — you are behind it.'),
      RF: backup('1B', 'The relay finishes at first. Get behind that bag.'),
    },
  },

  {
    id: 'S3',
    outs: 1,
    runners: ['1B'],
    ball: { type: 'grounder', location: 'second baseman', spot: 'grounder-2B' },
    prompt: 'One out. Runner on 1st. Ground ball to the second baseman.',
    responsibilities: {
      '2B': field('2B', 'Whoever fields it, the other covers. Feed the shortstop at the bag.', {
        move: { to: 'grounder-2B' },
        throw: { to: '2B', order: 1 },
      }),
      SS: cover('2B', 'Middle infielders swap — she fields, you cover and turn it.', {
        throw: { to: '1B', order: 2 },
      }),
      '1B': cover('1B', 'Back to the bag for the second half of the double play.'),
      '3B': cover('3B', 'Stay put and own third.'),
      P: backup('1B', 'Get behind first for the throw finishing the double play.'),
      C: cover('home', 'Runner aboard — protect the plate.'),
      RF: backup('ball', 'Ball on your side — charge in behind the second baseman.', {
        move: { to: { between: ['RF', 'grounder-2B'], t: 0.45 } },
      }),
      CF: backup('2B', 'First throw goes to second base. Be behind it.'),
      LF: backup('3B', 'Long way to run, but third is uncovered if the throw gets away.'),
    },
  },

  {
    id: 'S4',
    outs: 0,
    runners: ['2B'],
    ball: { type: 'grounder', location: 'shortstop', spot: 'grounder-SS' },
    prompt: 'No outs. Runner on 2nd. Ground ball to the shortstop.',
    responsibilities: {
      SS: field('1B', 'Look her back so she cannot walk to third — then take the out at first.', {
        move: { to: 'grounder-SS' },
        throw: { to: '1B', order: 1 },
      }),
      '2B': cover('2B', 'Runner leaves second — the bag is still yours to protect.'),
      '3B': cover('3B', 'Runner on 2nd will try to advance. Be standing on your base.'),
      '1B': cover('1B', 'Get to the bag and give her a target.'),
      P: backup('1B', 'Get behind first — if the throw sails, that run scores.'),
      C: cover('home', 'Runner in scoring position. You never leave the plate.'),
      LF: backup('ball', 'Break in behind the shortstop.', {
        move: { to: { between: ['LF', 'grounder-SS'], t: 0.45 } },
      }),
      CF: backup('2B', 'Slide in behind second in case of a play on the runner.'),
      RF: backup('1B', 'Behind first on every throw over there.'),
    },
  },

  {
    id: 'S5',
    outs: 1,
    runners: ['2B', '3B'],
    ball: { type: 'gap', location: 'left-center gap', spot: 'LF-CF gap' },
    prompt: 'One out. Runners on 2nd and 3rd. Ball drilled into the gap between left and center.',
    tags: ['relay'],
    relaySide: 'left',
    responsibilities: {
      SS: relay('home', 'Deep ball with runners in scoring position — the shortstop becomes the relay so the throw stays accurate and gives you a shot at the lead runner.', {
        move: { to: { between: ['LF-CF gap', 'home'], t: 0.3 } },
        throw: { to: 'home', order: 2 },
      }),
      '2B': cover('2B', 'Trail the play and own second — you take any throw behind a runner.'),
      '3B': cover('3B', 'Batter-runner is thinking triple. Be on the bag.'),
      '1B': relay('home', 'Trail toward the mound as the second cutoff so there is always someone in line to home.', {
        move: { to: 'trail-mound' },
      }),
      C: cover('home', 'Protect the plate and call the target for the relay — she cannot see the runners.'),
      LF: field('2B', 'Get to it, turn, and hit the relay — do not try to throw it all the way in.', {
        move: { to: 'LF-CF gap' },
        throw: { to: { between: ['LF-CF gap', 'home'], t: 0.3 }, order: 1 },
        label: 'Field it — hit the relay',
      }),
      CF: backup('ball', 'Sprint to the gap with her. Two gloves beat one on a ball in the alley.', {
        move: { to: { between: ['CF', 'LF-CF gap'], t: 0.55 } },
      }),
      RF: backup('2B', 'Cross the field behind second — the throw could come there.'),
      P: backup('home', 'Get behind the catcher. The play is at the plate.'),
    },
  },

  {
    id: 'S6',
    outs: 0,
    runners: [],
    ball: { type: 'fly', location: 'shallow right-center', spot: 'shallow RCF' },
    prompt: 'No outs. Bases empty. Catchable fly ball dropping into shallow right-center.',
    responsibilities: {
      '2B': talk('Go get it — but center field has priority. Loud, early talk prevents collisions and dropped balls.', {
        move: { to: { between: ['2B', 'shallow RCF'], t: 0.5 } },
      }),
      CF: field('hold', 'You have priority over everyone. Call it early and call it loud.', {
        move: { to: 'shallow RCF' },
      }),
      RF: backup('ball', 'Back her up — if it drops, you keep it to a single.', {
        move: { to: { between: ['RF', 'shallow RCF'], t: 0.55 } },
      }),
      SS: cover('2B', 'Somebody owns second on every ball in the air. Today it is you.'),
      '1B': cover('1B', 'Get to the bag in case it drops and the batter turns hard.'),
      '3B': cover('3B', 'Stay home on your base.'),
      C: cover('home', 'Mask off, stay at the plate, keep talking.'),
      LF: backup('ball', 'Drift toward center — you are the third set of eyes.', {
        move: { to: { between: ['LF', 'shallow RCF'], t: 0.35 } },
      }),
      P: talk('Get out of the way and echo the call. This one is not yours.', {
        move: { to: 'trail-mound' },
      }),
    },
  },

  {
    id: 'S7',
    outs: 1,
    runners: ['1B'],
    batterHand: 'R',
    count: { balls: 1, strikes: 1 },
    ball: { type: 'steal', location: 'straight steal of 2nd', spot: '2B', advance: { from: '1B', to: '2B' } },
    prompt: 'One out. Runner on 1st, right-handed batter. She takes off on the pitch — straight steal, batter takes it.',
    tags: ['steal'],
    responsibilities: {
      SS: cover('2B', 'Know before the pitch whose bag it is — there is no time to decide once she runs. Take the throw and put the tag down.', {
        label: 'Cover 2nd — take the throw and tag',
      }),
      '2B': backup('2B', 'Not your bag on this one, so get behind it. An overthrow with nobody there is a run.'),
      C: field('2B', 'Catch it clean, feet set, throw through the bag.', {
        move: { to: 'plate' },
        throw: { to: '2B', order: 1 },
        label: 'Receive and throw to 2nd',
      }),
      P: talk('Duck out of the throwing lane and read the play.', { move: { to: 'short-left' } }),
      '1B': cover('1B', 'Back to your bag — the batter is still standing there.'),
      '3B': cover('3B', 'She is not stopping at second if the throw gets away. Own third.'),
      CF: backup('2B', 'Every throw to second gets you behind it.'),
      RF: backup('2B', 'Come in behind the bag with center.'),
      LF: backup('3B', 'If the ball skips into center, the next play is at third.'),
    },
  },

  {
    id: 'S7b',
    outs: 0,
    runners: ['1B'],
    batterHand: 'L',
    count: { balls: 2, strikes: 0 },
    ball: { type: 'steal', location: 'straight steal of 2nd', spot: '2B', advance: { from: '1B', to: '2B' } },
    prompt: 'No outs. Runner on 1st, left-handed batter at the plate. Runner goes on the pitch.',
    tags: ['steal'],
    responsibilities: {
      SS: cover('2B', 'Coverage is set before the pitch by the batter in the box. Take the throw and tag.', {
        label: 'Cover 2nd — take the throw and tag',
      }),
      '2B': backup('2B', 'Your partner has the bag — you get behind it for the overthrow.'),
      C: field('2B', 'Clean transfer, quick feet, throw it through the bag.', {
        move: { to: 'plate' },
        throw: { to: '2B', order: 1 },
        label: 'Receive and throw to 2nd',
      }),
      P: talk('Clear the throwing lane and read it.', { move: { to: 'short-right' } }),
      '1B': cover('1B', 'Stay with your bag and the batter.'),
      '3B': cover('3B', 'Third is live if the ball gets past the bag.'),
      CF: backup('2B', 'Behind the bag on every throw to second.'),
      RF: backup('2B', 'Come in with center behind second.'),
      LF: backup('3B', 'Cover the next base in the chain.'),
    },
  },

  {
    id: 'S8',
    outs: 0,
    runners: [],
    ball: { type: 'fly', location: 'deep left field', spot: 'deep LF' },
    prompt: 'No outs. Bases empty. High fly ball hit deep to left field.',
    responsibilities: {
      LF: field('hold', 'Get under it, catch it moving toward the infield, and hit the cut if she is out there.', {
        move: { to: 'deep LF' },
      }),
      CF: backup('ball', 'Sprint over behind her. Deep balls get lost in the sun and the lights.', {
        move: { to: { between: ['CF', 'deep LF'], t: 0.75 } },
      }),
      SS: backup('ball', 'Run out toward the ball as the relay in case it gets down or over her.', {
        move: { to: { between: ['SS', 'deep LF'], t: 0.5 } },
      }),
      '2B': cover('2B', 'Somebody has to be at second on a deep ball. That is you.'),
      '3B': cover('3B', 'Deep ball, nobody on — protect third for a hustle double.'),
      '1B': cover('1B', 'Stay with your bag and watch the batter-runner.'),
      C: cover('home', 'Stay home and call the play in front of you.'),
      P: backup('2B', 'The throw comes back to second. Get behind it.'),
      RF: backup('ball', 'Long run, but you drift toward every ball in the air.', {
        move: { to: { between: ['RF', 'deep LF'], t: 0.3 } },
      }),
    },
  },

  {
    id: 'S9',
    outs: 1,
    runners: ['3B'],
    ball: { type: 'grounder', location: 'third baseman', spot: 'grounder-3B' },
    prompt: 'One out. Runner on 3rd, infield playing in. Sharp ground ball to third — the runner breaks for the plate.',
    responsibilities: {
      '3B': field('home', 'Infield is in to stop the run. She broke, so you go get her at the plate.', {
        move: { to: 'grounder-3B' },
        throw: { to: 'home', order: 1 },
      }),
      C: cover('home', 'Block the plate, give a target, be ready to tag.'),
      SS: cover('3B', 'Third baseman fields it, so the shortstop takes third. Always.'),
      '2B': cover('2B', 'Batter-runner will keep running on a play at the plate. Own second.'),
      '1B': cover('1B', 'If the catcher runs her back, the next throw is yours.'),
      P: backup('home', 'Get behind the catcher on any throw to the plate.'),
      LF: backup('3B', 'A rundown ends at third. Get over there.'),
      CF: backup('2B', 'Batter-runner is going for second on the throw home. Back up the bag.'),
      RF: backup('1B', 'Behind first in case they come back that way.'),
    },
  },

  {
    id: 'S10',
    outs: 2,
    runners: ['1B'],
    ball: { type: 'line', location: 'right field', spot: 'single-RF' },
    prompt: 'Two outs. Runner on 1st. Base hit into right field — the runner is digging for third.',
    responsibilities: {
      RF: field('3B', 'Come through the ball and throw to third — that is where the runner is going.', {
        move: { to: 'single-RF' },
        throw: { to: { between: ['single-RF', '3B'], t: 0.55 }, order: 1 },
        label: 'Field it — throw to 3rd',
      }),
      SS: relay('3B', 'Shortstop is the cutoff on every throw to third. Line up and listen for the call.', {
        move: { to: { between: ['single-RF', '3B'], t: 0.55 } },
        throw: { to: '3B', order: 2 },
      }),
      '3B': cover('3B', 'Straddle the bag and give her a target for the tag.'),
      '2B': cover('2B', 'Shortstop is out cutting, so second is yours.'),
      '1B': cover('1B', 'Batter-runner rounds hard — stay with your bag.'),
      C: cover('home', 'Never leave the plate with a runner rounding third.'),
      P: backup('3B', 'The throw is going to third. Get behind it.'),
      CF: backup('ball', 'Sprint over behind right field.', {
        move: { to: { between: ['CF', 'single-RF'], t: 0.7 } },
      }),
      LF: backup('3B', 'Come in behind third with the pitcher.'),
    },
  },

  {
    id: 'S11',
    outs: 0,
    runners: ['2B'],
    ball: { type: 'line', location: 'left field', spot: 'single-LF' },
    prompt: 'No outs. Runner on 2nd. Clean base hit to left field — she is being waved home.',
    responsibilities: {
      LF: field('home', 'Charge it, get behind it, and throw through the cutoff to the plate.', {
        move: { to: 'single-LF' },
        throw: { to: { between: ['single-LF', 'home'], t: 0.62 }, order: 1 },
      }),
      '1B': relay('home', 'First baseman is the cutoff on every throw home. Line up between the ball and the plate.', {
        move: { to: { between: ['single-LF', 'home'], t: 0.62 } },
        throw: { to: 'home', order: 2 },
      }),
      C: cover('home', 'Set up, give a lane, and call cut or let it go — she cannot see the runner.'),
      '3B': cover('3B', 'Batter-runner may try to stretch it. Own your bag.'),
      '2B': cover('2B', 'Somebody is at second on every base hit. That is you.'),
      SS: backup('2B', 'Trail behind second for a throw behind the batter-runner.'),
      P: backup('home', 'Get behind the catcher. If the cutoff lets it go, you are the last line.'),
      CF: backup('ball', 'Run over behind left field.', {
        move: { to: { between: ['CF', 'single-LF'], t: 0.7 } },
      }),
      RF: backup('2B', 'Long way over, but back up second on the throw in.'),
    },
  },

  {
    id: 'S12',
    outs: 2,
    runners: [],
    ball: { type: 'fly', location: 'foul territory near 1st', spot: 'pop-1B-foul' },
    prompt: 'Two outs. Bases empty. Pop fly drifting into foul ground near first base.',
    responsibilities: {
      '1B': field('hold', 'Your ball until someone louder calls you off. Get under it and squeeze it.', {
        move: { to: 'pop-1B-foul' },
      }),
      C: talk('Mask off, point it out, and direct her to the ball — she cannot track it and run at the same time.', {
        move: { to: { between: ['C', 'pop-1B-foul'], t: 0.45 } },
      }),
      '2B': backup('ball', 'Trail her over — if she has to dive, somebody has to be there.', {
        move: { to: { between: ['2B', 'pop-1B-foul'], t: 0.6 } },
      }),
      RF: backup('ball', 'Come in hard behind the play.', {
        move: { to: { between: ['RF', 'pop-1B-foul'], t: 0.65 } },
      }),
      P: talk('Point and echo the call, then clear out of the way.', { move: { to: 'short-right' } }),
      SS: cover('2B', 'Stay disciplined — someone owns second even on a foul pop.'),
      '3B': cover('3B', 'Hold third. Not your side of the field.'),
      CF: backup('ball', 'Drift toward right. Every ball in the air gets a backup.', {
        move: { to: { between: ['CF', 'pop-1B-foul'], t: 0.35 } },
      }),
      LF: backup('2B', 'Long run to second, but that is the base behind the play.'),
    },
  },

  {
    id: 'S13',
    outs: 1,
    runners: ['1B', '2B', '3B'],
    ball: { type: 'grounder', location: 'second baseman', spot: 'grounder-2B' },
    prompt: 'One out. Bases loaded. Sharp ground ball right at the second baseman.',
    responsibilities: {
      '2B': field('2B', 'Two outs beat one run — the force at second starts the double play and ends the inning threat.', {
        move: { to: 'grounder-2B' },
        throw: { to: '2B', order: 1 },
      }),
      SS: cover('2B', 'She fields, you cover. Take the feed and finish it at first.', {
        throw: { to: '1B', order: 2 },
      }),
      '1B': cover('1B', 'Stretch for the back half — that is the third out.'),
      C: cover('home', 'Force is at home too. Stay on the plate and be ready if she comes to you.'),
      '3B': cover('3B', 'Force at third is live. Be on your bag.'),
      P: backup('home', 'Runner on third scores on any bad throw. Get behind the plate.'),
      LF: backup('3B', 'Cover the base behind the play.'),
      CF: backup('2B', 'The first throw goes to second. Be behind it.'),
      RF: backup('1B', 'The double play finishes at first. That is your backup.'),
    },
  },

  {
    id: 'S14',
    outs: 0,
    runners: ['1B'],
    ball: { type: 'line', location: 'shortstop', spot: 'grounder-SS' },
    prompt: 'No outs. Runner on 1st. Line drive hit right at the shortstop — she catches it in the air.',
    responsibilities: {
      SS: field('1B', 'You caught it, so the runner has to get back. Throw behind her and double her off.', {
        move: { to: 'grounder-SS' },
        throw: { to: '1B', order: 1 },
      }),
      '1B': cover('1B', 'Sprint back to the bag — the double play is standing right there.'),
      '2B': cover('2B', 'Own second in case she gets in a rundown between the bags.'),
      '3B': cover('3B', 'Stay home on your base.'),
      P: backup('1B', 'Get behind first — the throw is coming your way in a hurry.'),
      C: cover('home', 'Runner aboard. Protect the plate.'),
      CF: backup('2B', 'If it turns into a rundown, second is where it ends.'),
      RF: backup('1B', 'Behind the bag on every throw to first.'),
      LF: backup('ball', 'Break in behind the shortstop in case she cannot squeeze it.', {
        move: { to: { between: ['LF', 'grounder-SS'], t: 0.45 } },
      }),
    },
  },

  {
    id: 'S15',
    outs: 2,
    runners: ['2B'],
    ball: { type: 'gap', location: 'right-center gap', spot: 'RF-CF gap' },
    prompt: 'Two outs. Runner on 2nd. Ball rockets into the gap between center and right.',
    tags: ['relay'],
    relaySide: 'right',
    responsibilities: {
      '2B': relay('home', 'Ball on the right side, so the second baseman is the relay. Sprint out, line up, catch and redirect.', {
        move: { to: { between: ['RF-CF gap', 'home'], t: 0.3 } },
        throw: { to: 'home', order: 2 },
      }),
      SS: cover('2B', 'She is out relaying, so second is yours — take any throw behind a runner.'),
      '1B': relay('home', 'Trail toward the mound as the second cutoff for the throw home.', {
        move: { to: 'trail-mound' },
      }),
      '3B': cover('3B', 'Two outs — the batter-runner is running until someone stops her. Own third.'),
      C: cover('home', 'Set the target and call the relay in or let it go.'),
      CF: field('2B', 'Get to it and hit the relay. Never try to throw it all the way home.', {
        move: { to: 'RF-CF gap' },
        throw: { to: { between: ['RF-CF gap', 'home'], t: 0.3 }, order: 1 },
        label: 'Field it — hit the relay',
      }),
      RF: backup('ball', 'Sprint to the gap with her.', {
        move: { to: { between: ['RF', 'RF-CF gap'], t: 0.55 } },
      }),
      LF: backup('2B', 'Cross behind second base on the throw in.'),
      P: backup('home', 'Play is at the plate. Get behind the catcher.'),
    },
  },

  {
    id: 'S16',
    outs: 0,
    runners: ['1B'],
    ball: { type: 'grounder', location: 'bunt down the 1st base line', spot: 'bunt-1B-line' },
    prompt: 'No outs. Runner on 1st. Sacrifice bunt rolls slowly down the first base line.',
    responsibilities: {
      '1B': field('1B', 'Charge it, bare hand or two hands, and take the sure out at first.', {
        move: { to: 'bunt-1B-line' },
        throw: { to: '1B', order: 1 },
      }),
      '2B': cover('1B', 'First baseman charged, so you cover first. Beat her there and give a target.'),
      SS: cover('2B', 'The runner is going to second. Be standing on the bag.'),
      C: talk('You see the whole play — call who takes it and where the throw goes.', {
        move: { to: { between: ['C', 'bunt-1B-line'], t: 0.35 } },
      }),
      P: backup('1B', 'Break toward the line, defer if she calls you off, then get behind first.'),
      '3B': cover('3B', 'Bunt is on the other side. Protect your bag.'),
      CF: backup('2B', 'The runner ends up at second. Be behind that bag.'),
      RF: backup('1B', 'Charge in behind first — bunt throws get rushed.'),
      LF: backup('3B', 'Cover the next base in the chain.'),
    },
  },

  {
    id: 'S17',
    outs: 1,
    runners: ['3B'],
    ball: { type: 'fly', location: 'medium left field', spot: 'medium-LF' },
    prompt: 'One out. Runner on 3rd. Medium-depth fly ball to left — she will tag and go.',
    responsibilities: {
      LF: field('home', 'Catch it moving toward the plate and throw through the cutoff.', {
        move: { to: 'medium-LF' },
        throw: { to: { between: ['medium-LF', 'home'], t: 0.6 }, order: 1 },
      }),
      '1B': relay('home', 'First baseman is the cutoff on throws home. Line up and listen for the catcher.', {
        move: { to: { between: ['medium-LF', 'home'], t: 0.6 } },
        throw: { to: 'home', order: 2 },
      }),
      C: cover('home', 'Give her a lane, then block and tag. This is your out.'),
      '3B': cover('3B', 'Stand on the bag until she leaves it — make sure she does not go early.'),
      '2B': cover('2B', 'Own second in case the batter-runner does something silly.'),
      SS: backup('ball', 'Trail out toward left as the safety in case the ball drops.', {
        move: { to: { between: ['SS', 'medium-LF'], t: 0.45 } },
      }),
      P: backup('home', 'Behind the catcher on every throw to the plate.'),
      CF: backup('ball', 'Get behind her on the catch.', {
        move: { to: { between: ['CF', 'medium-LF'], t: 0.7 } },
      }),
      RF: backup('2B', 'Come in behind second on the throw in.'),
    },
  },

  {
    id: 'S18',
    outs: 1,
    runners: ['1B', '2B'],
    ball: { type: 'fly', location: 'pop up between SS and 3B', spot: 'pop-SS-3B' },
    prompt: 'One out. Runners on 1st and 2nd. Pop up straight into the sky between short and third.',
    responsibilities: {
      SS: field('hold', 'You are moving toward the ball, she is backing up — the shortstop takes it. Call it early.', {
        move: { to: 'pop-SS-3B' },
      }),
      '3B': talk('Get out of her way and echo the call, then get back to your bag.', {
        move: { to: { between: ['3B', 'pop-SS-3B'], t: 0.3 } },
      }),
      '2B': cover('2B', 'Runners hold on a pop up, but somebody owns second every single pitch.'),
      '1B': cover('1B', 'Stay with your bag and the batter-runner.'),
      C: cover('home', 'Mask off, get out from behind the plate, and help direct the pop.'),
      P: talk('Point it out and clear the area. Never fight an infielder for a pop up.', {
        move: { to: 'short-left' },
      }),
      LF: backup('ball', 'Charge in behind her — pop ups get lost in the sky.', {
        move: { to: { between: ['LF', 'pop-SS-3B'], t: 0.6 } },
      }),
      CF: backup('2B', 'Lead runner goes to third if it drops. Back up the middle.'),
      RF: backup('1B', 'Come in behind first on the throw back in.'),
    },
  },
];

export function scenariosForPosition(position) {
  return SCENARIOS.filter((s) => Boolean(s.responsibilities[position]));
}
