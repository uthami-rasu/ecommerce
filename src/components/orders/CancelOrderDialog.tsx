import { useEffect, useRef } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

type CancelOrderDialogProps = {
  orderNumber: string
  open: boolean
  busy: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Accessible confirm dialog for cancelling an unpaid order. */
export function CancelOrderDialog({ orderNumber, open, busy, onConfirm, onClose }: CancelOrderDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
      onClick={(event) => {
        if (event.target === dialog.current && !busy) onClose()
      }}
      aria-labelledby="cancel-order-title"
      aria-describedby="cancel-order-desc"
      className="m-auto w-[min(440px,calc(100%-2rem))] rounded-3xl border border-stone-200 bg-white p-0 text-stone-800 shadow-2xl backdrop:bg-stone-950/50 backdrop:backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
    >
      <div className="p-6 sm:p-7">
        <span className="grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertTriangle size={22} aria-hidden />
        </span>
        <h2 id="cancel-order-title" className="mt-4 text-xl font-bold text-[#173f32] dark:text-stone-50">Cancel this order?</h2>
        <p id="cancel-order-desc" className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Order <b className="font-mono font-semibold text-stone-700 dark:text-stone-200">{orderNumber}</b> will be cancelled and its items released. This can’t be undone.
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" autoFocus onClick={onClose} disabled={busy} className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:border-stone-400 disabled:opacity-50 dark:border-stone-700 dark:text-stone-200">
            Keep order
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-60">
            {busy && <Loader2 size={15} className="animate-spin" aria-hidden />} Yes, cancel order
          </button>
        </div>
      </div>
    </dialog>
  )
}
