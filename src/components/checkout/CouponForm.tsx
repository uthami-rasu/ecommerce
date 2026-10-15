import { useState } from 'react'
import { AlertCircle, Loader2, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { useApplyCouponMutation, useRemoveCouponMutation } from '../../features/cart/cartApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Cart } from '../../types/api'
import { formatMoney } from '../../utils/format'

/** Apply / remove a coupon on the server cart; shows why a stored coupon no longer applies. */
export function CouponForm({ cart, compact = false }: { cart: Cart; compact?: boolean }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [applyCoupon, applyState] = useApplyCouponMutation()
  const [removeCoupon, removeState] = useRemoveCouponMutation()
  const inputId = compact ? 'coupon-code-summary' : 'coupon-code'

  // Not a <form>: on the checkout page this sits inside the place-order form.
  const submit = async () => {
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Enter a coupon code')
      return
    }
    setError(null)
    try {
      const updated = await applyCoupon(trimmed).unwrap()
      if (updated.coupon) {
        toast.success('Coupon applied', { description: `${updated.coupon.code} saves you ${formatMoney(updated.coupon.discount)}` })
        setCode('')
      } else if (updated.couponError) {
        setError(updated.couponError)
      }
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const remove = async () => {
    try {
      await removeCoupon().unwrap()
      toast.info('Coupon removed')
    } catch (err) {
      toast.error('Could not remove coupon', { description: errorMessage(err) })
    }
  }

  if (cart.coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
        <div className="flex min-w-0 items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
          <Tag size={15} aria-hidden />
          <p className="min-w-0 text-sm">
            <b className="font-bold tracking-wide">{cart.coupon.code}</b>
            <span className="text-emerald-700/80 dark:text-emerald-300/80"> · −{formatMoney(cart.coupon.discount)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={removeState.isLoading}
          aria-label={`Remove coupon ${cart.coupon.code}`}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
        >
          {removeState.isLoading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Remove
        </button>
      </div>
    )
  }

  const shownError = error ?? cart.couponError
  return (
    <div role="group" aria-labelledby={compact ? undefined : `${inputId}-title`} aria-label={compact ? 'Coupon' : undefined}>
      {!compact && (
        <>
          <h2 id={`${inputId}-title`} className="text-[17px] font-bold text-[#173f32] dark:text-stone-50">Have a coupon?</h2>
          <p className="mt-1 text-[13px] text-stone-500 dark:text-stone-400">Add your code for an instant cart discount.</p>
        </>
      )}
      <label htmlFor={inputId} className="sr-only">Coupon code</label>
      <div
        className={`flex h-12 items-center gap-2 rounded-2xl border bg-white pl-4 pr-1.5 transition focus-within:border-[#D9B27C] focus-within:ring-4 focus-within:ring-[#D9B27C]/20 dark:bg-stone-950 ${
          shownError ? 'border-rose-300 dark:border-rose-800' : 'border-stone-200 dark:border-stone-700'
        } ${compact ? '' : 'mt-3 max-w-md'}`}
      >
        <Tag size={15} className="flex-none text-stone-400" aria-hidden />
        <input
          id={inputId}
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase())
            setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void submit()
            }
          }}
          placeholder="Coupon code"
          autoComplete="off"
          aria-invalid={Boolean(shownError)}
          aria-describedby={shownError ? `${inputId}-error` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold tracking-wide outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={applyState.isLoading}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#173f32] px-4 text-xs font-bold text-white transition hover:bg-[#1e5040] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32] disabled:opacity-60 dark:bg-amber-300 dark:text-stone-900 dark:hover:bg-amber-200"
        >
          {applyState.isLoading && <Loader2 size={13} className="animate-spin" />} Apply
        </button>
      </div>
      {shownError && (
        <p id={`${inputId}-error`} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400" role="alert">
          <AlertCircle size={13} aria-hidden /> {shownError}
        </p>
      )}
    </div>
  )
}
