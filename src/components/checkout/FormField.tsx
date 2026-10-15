import type { ReactNode } from 'react'

type FormFieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + error/hint, wired up with ids for screen readers. */
export function FormField({ id, label, error, hint, optional, className = '', children }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-xs font-bold uppercase tracking-[0.08em] text-stone-600 dark:text-stone-300">
        {label}
        {optional && <span className="text-[11px] font-medium normal-case tracking-normal text-stone-400">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone-400">{hint}</p>
      ) : null}
    </div>
  )
}
