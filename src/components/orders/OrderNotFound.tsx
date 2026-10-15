import { PackageX, RefreshCw } from 'lucide-react'

type OrderNotFoundProps = {
  orderNumber: string
  /** Non-404 failures: show the message and a retry button. */
  error?: string
  onRetry?: () => void
}

/** 404 / load-error state for any page keyed by an order number. */
export function OrderNotFound({ orderNumber, error, onRetry }: OrderNotFoundProps) {
  return (
    <div className="checkout-fade-in mx-auto grid max-w-lg place-items-center rounded-[2rem] border border-stone-200 bg-white/80 px-6 py-14 text-center backdrop-blur dark:border-stone-800 dark:bg-stone-900/70" role={error ? 'alert' : undefined}>
      <span className="grid size-16 place-items-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        <PackageX size={28} aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-3xl font-bold text-[#173f32] dark:text-stone-50">{error ? 'Something went wrong' : 'Order not found'}</h2>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        {error ?? <>We couldn’t find order <b className="font-semibold text-stone-700 dark:text-stone-200">{orderNumber || '—'}</b> on your account.</>}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {error && onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-full bg-[#173f32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1e5040] dark:bg-amber-300 dark:text-stone-900">
            <RefreshCw size={14} aria-hidden /> Try again
          </button>
        )}
        <a href="#account/orders" className={`rounded-full px-6 py-3 text-sm font-bold transition ${error ? 'border border-stone-300 text-stone-700 hover:border-stone-400 dark:border-stone-700 dark:text-stone-200' : 'bg-[#173f32] text-white hover:bg-[#1e5040] dark:bg-amber-300 dark:text-stone-900'}`}>
          View my orders
        </a>
      </div>
    </div>
  )
}
