/** The app mark: a diamond seen from above, same shape as the field diagram. */
export default function DiamondMark({ size = 30 }) {
  return (
    <svg className="diamond-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" className="dm-plate" />
      <path d="M32 10 54 32 32 54 10 32 Z" className="dm-grass" />
      <path d="M32 21 43 32 32 43 21 32 Z" className="dm-dirt" />
      <path d="M32 10 54 32 32 54 10 32 Z" className="dm-line" />
      <circle cx="32" cy="32" r="3.6" className="dm-mound" />
    </svg>
  );
}
