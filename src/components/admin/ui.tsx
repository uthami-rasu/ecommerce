import { AlertTriangle, RotateCw, type LucideIcon } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { errorMessage } from '../../lib/http/apiClient'
import { btn, card } from './styles'

export function Card({ children, className = '', as: Tag = 'section', ...rest }: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article' | 'aside'
  'aria-labelledby'?: string
}) {
  return <Tag className={`${card} ${className}`} {...rest}>{children}</Tag>
}

export function CardHeader({ title, id, description, action, icon: Icon }: {
  title: ReactNode
  id?: string
  description?: ReactNode
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4 dark:border-stone-800">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && <Icon size={17} className="mt-0.5 shrink-0 text-[#aa753a] dark:text-amber-400" aria-hidden />}
        <div className="min-w-0">
          <h2 id={id} className="text-[15px] font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`admin-skeleton block ${className}`} />
}

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return <span aria-hidden className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
}

export function EmptyState({ icon: Icon, title, children, action }: {
  icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#f4efe4] text-[#aa753a] dark:bg-stone-800 dark:text-amber-400">
        <Icon size={22} aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold text-[#173f32] dark:text-stone-100">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, title = 'Couldn’t load this' }: { error: unknown; onRetry?: () => void; title?: string }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
        <AlertTriangle size={22} aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">{errorMessage(error)}</p>
      {onRetry && (
        <button type="button" className={`${btn.secondary} mt-5`} onClick={onRetry}>
          <RotateCw size={15} aria-hidden /> Try again
        </button>
      )}
    </div>
  )
}

/** Inline error box for forms / dialogs. */
export function InlineError({ error }: { error: unknown }) {
  if (!error) return null
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span>{errorMessage(error)}</span>
    </p>
  )
}

/** Accessible on/off switch with a label and optional hint. */
export function Switch({ checked, onChange, label, hint, disabled }: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  hint?: ReactNode
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-stone-800 dark:text-stone-200">{label}</label>
        {hint && <p id={`${id}-hint`} className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-stone-900 ${
          checked ? 'bg-[#173f32] dark:bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
        }`}
      >
        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

/** Label/value rows in a definition list. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-stone-900 dark:text-stone-100">{children}</dd>
    </div>
  )
}
