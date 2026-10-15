import { AlertCircle, ArrowLeft, RotateCcw, SearchX } from 'lucide-react'
import { SkeletonLine } from '../catalog/Skeletons'

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12" role="status" aria-label="Loading product">
      <SkeletonLine className="h-9 w-40" />
      <div className="product-detail-top mt-8">
        <div>
          <span className="catalog-skeleton block aspect-[1/1.04] rounded-[18px]" />
          <div className="mt-4 grid grid-cols-4 gap-2">{Array.from({ length: 4 }, (_, index) => <span className="catalog-skeleton block aspect-[1.22/1] rounded-[10px]" key={index} />)}</div>
        </div>
        <div className="space-y-4 pt-2">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-10 w-4/5" />
          <SkeletonLine className="h-3.5 w-3/5" />
          <SkeletonLine className="mt-8 h-8 w-40" />
          <div className="grid grid-cols-3 gap-4 pt-4">{Array.from({ length: 3 }, (_, index) => <SkeletonLine className="h-8" key={index} />)}</div>
          <div className="flex gap-2 pt-4">{Array.from({ length: 3 }, (_, index) => <SkeletonLine className="h-11 w-20" key={index} />)}</div>
          <SkeletonLine className="mt-4 h-12 w-full" />
          <span className="catalog-skeleton mt-4 block h-28 rounded-xl" />
        </div>
      </div>
      <span className="sr-only">Loading product…</span>
    </div>
  )
}

export function ProductNotFound() {
  return (
    <div className="pdp-state">
      <span className="pdp-state-icon"><SearchX size={30} /></span>
      <p className="pdp-state-eyebrow">Error 404</p>
      <h1>This jar has wandered off</h1>
      <p>The product you’re looking for may have sold out for the season or moved. Let’s find you something just as good.</p>
      <div>
        <a className="pdp-state-primary" href="#shop">Browse the shop</a>
        <a className="pdp-state-secondary" href="#home"><ArrowLeft size={14} /> Back home</a>
      </div>
    </div>
  )
}

export function ProductLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="pdp-state" role="alert">
      <span className="pdp-state-icon"><AlertCircle size={30} /></span>
      <h1>We couldn’t load this product</h1>
      <p>{message}</p>
      <div>
        <button className="pdp-state-primary" type="button" onClick={onRetry}><RotateCcw size={14} /> Try again</button>
        <a className="pdp-state-secondary" href="#shop">Browse the shop</a>
      </div>
    </div>
  )
}
