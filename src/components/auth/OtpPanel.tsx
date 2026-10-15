import { useId, useState } from 'react'
import { Clock3, MailCheck, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { errorMessage } from '../../lib/http/apiClient'
import type { OtpChallenge } from '../../types/api'
import { LinkButton, Spinner } from './FormBits'
import { OtpInput } from './OtpInput'
import { formatSeconds, useCountdown } from './useCountdown'

type OtpPanelProps = {
  email: string
  /** The code that was just sent; null when the page was opened without one (reload, email link…). */
  challenge: OtpChallenge | null
  code: string
  onCodeChange: (code: string) => void
  onComplete?: (code: string) => void
  /** Requests a fresh code; resolve with the new challenge (or throw). */
  onResend: () => Promise<OtpChallenge>
  onChangeEmail?: () => void
  changeEmailLabel?: string
  error?: string | null
  errorKey?: number
  disabled?: boolean
  autoFocus?: boolean
}

/**
 * The shared "enter the 6-digit code" block: who it went to, the digit boxes,
 * expiry + resend countdowns and the dev inbox hint. Remount (key) it for a new challenge.
 */
export function OtpPanel({
  email, challenge, code, onCodeChange, onComplete, onResend, onChangeEmail, changeEmailLabel = 'Change email',
  error, errorKey, disabled, autoFocus = true,
}: OtpPanelProps) {
  const [sent, setSent] = useState(Boolean(challenge))
  const [resending, setResending] = useState(false)
  const resend = useCountdown(challenge?.resendAfterSeconds ?? 0)
  const expiry = useCountdown(challenge?.expiresInSeconds ?? 0)
  const errorId = useId()

  const requestCode = async () => {
    setResending(true)
    try {
      const next = await onResend()
      resend.start(next.resendAfterSeconds)
      expiry.start(next.expiresInSeconds)
      onCodeChange('')
      toast.success(sent ? 'A new code is on its way' : 'Code sent', { description: `Check ${next.email}` })
      setSent(true)
    } catch (err) {
      toast.error('Could not send the code', { description: errorMessage(err) })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-[#D9B27C]/30 bg-[#fbf3e6]/70 px-4 py-3 dark:border-amber-200/10 dark:bg-amber-100/5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#173f32] text-amber-100 dark:bg-amber-200/15 dark:text-amber-200">
          <MailCheck size={18} />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="text-stone-600 dark:text-stone-300">{sent ? 'Code sent to' : 'Code will be sent to'}</p>
          <p className="truncate font-semibold text-stone-900 dark:text-stone-50" title={email}>{email}</p>
        </div>
        {onChangeEmail && (
          <LinkButton className="shrink-0 text-xs" onClick={onChangeEmail}>
            {changeEmailLabel}
          </LinkButton>
        )}
      </div>

      <div>
        <OtpInput
          value={code}
          onChange={onCodeChange}
          onComplete={onComplete}
          disabled={disabled}
          invalid={Boolean(error)}
          errorKey={errorKey}
          autoFocus={autoFocus}
          describedBy={error ? errorId : undefined}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-3 text-center text-sm font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-stone-400">
        <span className="inline-flex items-center gap-1.5" aria-live="polite">
          <Clock3 size={13} aria-hidden="true" />
          {!sent
            ? 'Request a code to continue'
            : expiry.remaining > 0
              ? <>Code expires in <strong className="tabular-nums text-stone-700 dark:text-stone-200">{formatSeconds(expiry.remaining)}</strong></>
              : 'This code may have expired — request a new one'}
        </span>
        {!sent ? null : resend.remaining > 0 ? (
          <span className="tabular-nums">Resend in {formatSeconds(resend.remaining)}</span>
        ) : (
          <LinkButton className="inline-flex items-center gap-1.5 text-xs" onClick={requestCode} disabled={resending}>
            {resending ? <Spinner className="size-3" /> : <RotateCw size={13} aria-hidden="true" />}
            {sent ? 'Resend code' : 'Send a new code'}
          </LinkButton>
        )}
      </div>

      {!sent && (
        <button
          type="button"
          onClick={requestCode}
          disabled={resending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#173f32]/25 bg-white/70 text-sm font-bold text-[#173f32] transition hover:border-[#173f32] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/40 disabled:opacity-60 dark:border-amber-200/25 dark:bg-stone-900/60 dark:text-amber-100 dark:hover:border-amber-200/60"
        >
          {resending ? <Spinner /> : <RotateCw size={15} aria-hidden="true" />}
          Send a new code
        </button>
      )}

      {import.meta.env.DEV && (
        <p className="rounded-lg bg-stone-100/80 px-3 py-2 text-[11px] leading-relaxed text-stone-500 dark:bg-stone-800/60 dark:text-stone-400">
          Development: emails are captured by Mailpit at{' '}
          <a className="font-semibold text-[#173f32] underline underline-offset-2 dark:text-amber-200" href="http://localhost:8025" target="_blank" rel="noreferrer">
            http://localhost:8025
          </a>
        </p>
      )}
    </div>
  )
}
