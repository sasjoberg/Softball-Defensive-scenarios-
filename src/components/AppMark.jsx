/** The app mark — same glove artwork the browser uses for the tab and home screen. */
export default function AppMark({ size = 30 }) {
  return <img className="app-mark" src="/icon.svg" width={size} height={size} alt="" />;
}
