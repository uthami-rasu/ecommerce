import '../../styles/catalog.css'
/** Shimmering placeholders shaped like the cards they stand in for. */

export function CatalogCardSkeleton() {
  return (
    <div className="loading-product-card" aria-hidden="true">
      <span className="loading-media" />
      <span className="loading-line loading-line-short" />
      <span className="loading-line" />
      <span className="loading-line loading-line-mid" />
      <span className="loading-button" />
    </div>
  )
}

export function HomeCardSkeleton() {
  return (
    <div className="product-card mx-auto flex w-full flex-col p-2.5" aria-hidden="true">
      <span className="catalog-skeleton block aspect-[4/3.9] rounded-[19px]" />
      <span className="catalog-skeleton mt-5 ml-3 block h-2.5 w-16 rounded-full" />
      <span className="catalog-skeleton mt-3 ml-3 block h-4 w-3/4 rounded-full" />
      <span className="mt-6 flex items-center justify-between px-3 pb-3">
        <span className="catalog-skeleton block h-4 w-14 rounded-full" />
        <span className="catalog-skeleton block h-9 w-20 rounded-full" />
      </span>
    </div>
  )
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <span className={`catalog-skeleton block rounded-full ${className}`} aria-hidden="true" />
}
