import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { btn } from './styles'

/**
 * Modal built on the native <dialog> element: focus trap, Esc, top layer and
 * inert background come for free. Mount it to open, unmount to close.
 */
export function Dialog({ title, description, icon, onClose, children, footer, busy = false, variant = 'modal', tone = 'default' }: {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** While true, Esc / backdrop clicks don't close (a request is in flight). */
  busy?: boolean
  variant?: 'modal' | 'drawer'
  tone?: 'default' | 'danger'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const busyRef = useRef(busy)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    busyRef.current = busy
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    window.lenis?.stop()
    const onCancel = (event: Event) => {
      event.preventDefault()
      if (!busyRef.current) onCloseRef.current()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      window.lenis?.start()
    }
  }, [])

  const isDrawer = variant === 'drawer'

  if (isDrawer) {
    return (
      <dialog
        ref={ref}
        className="admin-dialog admin-drawer"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <h2 id={titleId} className="sr-only">{title}</h2>
        <div data-lenis-prevent className="relative h-full overflow-y-auto overscroll-contain rounded-r-3xl shadow-2xl">
          {children}
          <button
            type="button"
            className="absolute right-3 top-4 grid size-9 place-items-center rounded-full text-emerald-50/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      </dialog>
    )
  }

  return (
    <dialog
      ref={ref}
      className="admin-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div
        className="flex max-h-[inherit] flex-col overflow-hidden rounded-t-3xl bg-white text-stone-900 shadow-2xl ring-1 ring-stone-200 sm:rounded-3xl dark:bg-stone-900 dark:text-stone-100 dark:ring-stone-800"
      >
        <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-stone-200 sm:hidden dark:bg-stone-700" />
        <header className="flex items-start gap-3 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
          {icon && (
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                tone === 'danger'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300'
                  : 'bg-[#eef4ef] text-[#173f32] dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-[1.65rem] font-bold leading-tight text-[#173f32] dark:text-stone-50">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
          </div>
          <button type="button" className={`${btn.icon} -mr-2 -mt-1`} onClick={onClose} disabled={busy} aria-label="Close">
            <X size={18} aria-hidden />
          </button>
        </header>
        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">
          {children}
        </div>
        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-stone-100 bg-stone-50/70 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6 dark:border-stone-800 dark:bg-stone-950/40">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  )
}
