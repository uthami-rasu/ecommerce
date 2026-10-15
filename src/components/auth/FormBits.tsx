import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, Info } from 'lucide-react'

const ALERT_TONES = {
  error: { icon: AlertCircle, className: 'border-rose-200 bg-rose-50/90 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200' },
  info: { icon: Info, className: 'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100' },
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200' },
}

export function FormAlert({ tone = 'error', children }: { tone?: keyof typeof ALERT_TONES; children: ReactNode }) {
  const { icon: Icon, className } = ALERT_TONES[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`auth-swap flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${className}`}>
      <Icon className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
      <div className="min-w-0 leading-snug">{children}</div>
    </div>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return <span className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden="true" />
}

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; loadingLabel?: string; arrow?: boolean }

/** Primary pill button with a busy state. */
export function SubmitButton({ loading, loadingLabel, arrow = true, children, className = '', disabled, ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#173f32] px-6 text-sm font-bold tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(23,63,50,0.7)] transition hover:bg-[#1e5040] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#D9B27C] dark:text-stone-950 dark:hover:bg-[#e4c08d] ${className}`}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {loading ? (
        <>
          <Spinner />
          {loadingLabel ?? children}
        </>
      ) : (
        <>
          {children}
          {arrow && <ArrowRight className="transition-transform group-hover:translate-x-0.5" size={16} aria-hidden="true" />}
        </>
      )}
    </button>
  )
}

/** Text-style link button used inside forms. */
export function LinkButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded font-semibold text-[#aa753a] underline-offset-4 transition hover:text-[#173f32] hover:underline focus-visible:outline-2 focus-visible:outline-[#D9B27C] disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60 dark:text-[#e4c08d] dark:hover:text-white ${className}`}
      {...props}
    />
  )
}
