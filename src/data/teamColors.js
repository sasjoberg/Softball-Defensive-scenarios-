// Team colours. `accent` is the app's highlight, `deep` the darker end of the
// button gradient, and `ink` the text that sits on top of the accent — each one
// picked to stay readable on this dark background.

export const TEAM_COLORS = [
  { id: 'gold', name: 'Gold', accent: '#ffc734', deep: '#f2a007', ink: '#24170a' },
  { id: 'red', name: 'Red', accent: '#f4626c', deep: '#d9525f', ink: '#2d0508' },
  { id: 'orange', name: 'Orange', accent: '#fb923c', deep: '#e2680f', ink: '#2b1204' },
  { id: 'royal', name: 'Royal', accent: '#6aa3ff', deep: '#4e80e5', ink: '#04173a' },
  { id: 'sky', name: 'Columbia', accent: '#67c7ec', deep: '#2b9bc7', ink: '#04202c' },
  { id: 'green', name: 'Green', accent: '#4fd18a', deep: '#1c9b5b', ink: '#04220f' },
  { id: 'purple', name: 'Purple', accent: '#b79bfb', deep: '#926ce5', ink: '#1a0a3a' },
  { id: 'silver', name: 'Silver', accent: '#cbd8e8', deep: '#93a6bd', ink: '#101b2c' },
];

export const DEFAULT_COLOR = 'gold';

export function colorById(id) {
  return TEAM_COLORS.find((c) => c.id === id) || TEAM_COLORS[0];
}
