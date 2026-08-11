# Mental Reps — Softball Defensive Scenarios

An interactive version of the spiral-bound situational field guide coaches keep in their
back pocket. Pick a position, get a randomized game situation, press a button for what
your job is, and the diagram animates the whole defense's movement so you can see whether
you were right.

Built for a phone in the dugout: big tap targets, no typing anywhere, one-handed.

## First run

The app opens once with a name field, a number field, and an optional row of position
chips for the spots she actually plays. Whatever she enters shows up as the app
title (*Maggie's Reps*), in the header next to her position (*Second Base · #26*), on her
dot in the field diagram (a gold **26** badge instead of a plain YOU tag), and in a few of
the celebration lines (*Locked in, Maggie!*). Her spots get flagged gold on the position
picker — on the field diagram and the list — with copy that keeps the other seven just as
open. All three fields are optional — *Skip for now* works, and nothing is flagged if she
skips — and all three are editable later under ⚙️ → Who's playing.

It is stored on that device only. Nothing is uploaded, and each phone that opens the link
gets its own name, number, and progress.

## Sharing it

The 🔗 button opens a share sheet with a QR code of the app's URL, generated on-device as
an SVG. Hold the phone up in the dugout and teammates point a camera at it. **Share link**
uses the native share sheet where the browser supports it and falls back to copying, and
**Copy link** is always there.

## The loop

1. **Pick a position** — tap a dot on the field or a card from the list. The spots she
   named as her own are flagged gold, but all nine are always playable.
2. **Read the situation** — a broadcast-style readout across the top (lit bases, outs,
   and the count), the situation in one sentence, and the ball flying out to where it was
   hit so you can see the play you're reading before you answer.
3. **Press your job** — one of eight job buttons, plus a target row when the job needs one
   ("field it → throw to 2nd", "cutoff/relay → home", "back up 1st").
4. **Get graded** — gold star, a rotating affirmation, and a streak tick for a hit. A miss
   gets "Not quite, try again" and a second look; after that (or on *Show me the play*) the
   answer and the one-line *why* are revealed.
5. **Watch the play** — the batted ball, every fielder's movement, and every throw animate
   on the top-down field, with your position glowing gold and tagged YOU. *See the whole
   defense* lists all nine assignments, like the facing page in the book.

## Two modes

- **Quiz** — the drill above, with streaks and per-position accuracy.
- **Study** — flip through every situation for a position with the answer and diagram
  already showing. No scoring. This is the "learn a new position" mode.

## Team coverage settings

Coverage systems vary team to team, so the two assignments that actually differ are
configurable in the settings sheet (⚙️), and every answer in the app follows the setting:

- **Relay on deep balls** — SS relays the left side and 2B the right side (default), or swapped.
- **Steal coverage** — righty at the plate → SS covers (default), righty → 2B covers,
  or shortstop/second baseman always.

The seed bank is written in the most common convention. Flipping a setting remaps the
middle-infield responsibilities on every affected scenario.

## Scenario bank

19 verified situations in `src/data/scenarios.js`, each with a job, a one-line *why*, and
diagram movement for **all nine positions** — so any position has a full set of reps.
It covers routine grounders, double-play depth, runners in scoring position, the deep gap
relay, communication and priority balls, steals, bunt coverage, plays at the plate, and
foul pops.

Adding more is just another object in the same shape:

```js
{
  id: 'S19',
  outs: 1,
  runners: ['1B'],
  ball: { type: 'grounder', location: 'shortstop', spot: 'grounder-SS' },
  prompt: 'One out. Runner on 1st. Ground ball to the shortstop.',
  responsibilities: {
    SS: field('2B', 'Force is on — get the lead runner.', {
      move: { to: 'grounder-SS' },
      throw: { to: '2B', order: 1 },
    }),
    '2B': cover('2B', 'She fields, you cover.'),
    // ...
  },
}
```

- `move.to` and `throw.to` take a named spot from `src/data/field.js`, an `{x, y}`, or
  `{ between: ['LF-CF gap', 'home'], t: 0.3 }` for a cutoff lining itself up between the
  ball and a base.
- `throw.order` 1 fires first, 2 after it — that's how a relay reads on the diagram.
- `count: { balls, strikes }` is optional; scenarios without one get a random count per rep
  (a stable one in study mode). Set it where the count is part of the situation.
- Steals set `ball.type: 'steal'` and `ball.advance: { from, to }` — the diagram shows the
  runner's jump instead of a batted ball.
- Tag a scenario `['relay']` or `['steal']` to make it follow the coverage settings.

Run `npm run validate` after editing: it checks every job id, target, and spot reference,
verifies each batted ball lands inside the fence, confirms each position still has reps,
and builds the play plan under all eight settings combinations.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run validate  # check the scenario bank
npm run lint
npm run build     # static output in dist/
```

React + Vite, plain CSS, inline SVG. One runtime dependency beyond React:
`qrcode-generator` (zero deps of its own) for the share QR. Athlete details, progress, and
settings persist to `localStorage` and fall back to in-memory state where storage is
blocked. `dist/` is a static bundle — deploy it anywhere (Vercel, Netlify, GitHub Pages).

## Not built (yet)

The optional AI expansion — generating fresh scenarios and coaching explanations from the
Claude API — is not included. The curated bank is the grading backbone and works end to
end on its own; an AI layer would need a small server to hold the API key, and any
generated scenarios should stay visibly separated from the verified bank.
