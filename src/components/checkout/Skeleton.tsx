/** Shimmering placeholder block. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`checkout-skeleton block rounded-lg ${className}`} />
}
