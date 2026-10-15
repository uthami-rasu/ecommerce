import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'

export const inputClass =
  'h-12 w-full rounded-xl border bg-white/80 px-4 text-[15px] text-stone-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition placeholder:text-stone-400 ' +
  'focus:border-[#D9B27C] focus:bg-white focus:ring-4 focus:ring-[#D9B27C]/20 disabled:cursor-not-allowed disabled:opacity-60 ' +
  'dark:bg-stone-900/70 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:bg-stone-900'

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string | null
  hint?: ReactNode
  icon?: LucideIcon
  trailing?: ReactNode
  /** Extra content on the label row, e.g. a "Forgot password?" link. */
  aside?: ReactNode
}

/** Labelled input with icon, inline error and hint, wired up for screen readers. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, icon: Icon, trailing, aside, id, className = '', ...input },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-600 dark:text-stone-300">
          {label}
          {input.required && <span className="text-[#aa753a]" aria-hidden="true"> *</span>}
        </label>
        {aside}
      </div>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={17} aria-hidden="true" />}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} ${Icon ? 'pl-11' : ''} ${trailing ? 'pr-12' : ''} ${
            error ? 'border-rose-400 dark:border-rose-500/70' : 'border-stone-200 dark:border-stone-700'
          }`}
          {...input}
        />
        {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      {hint && !error && (
        <div id={`${inputId}-hint`} className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </div>
      )}
    </div>
  )
})

/** Password input with a show / hide toggle. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type' | 'trailing'>>(function PasswordField(props, ref) {
  const [visible, setVisible] = useState(false)
  return (
    <Field
      ref={ref}
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-[#D9B27C] dark:hover:bg-stone-800 dark:hover:text-stone-200"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
    />
  )
})
