import { useState, type FormEvent } from 'react'
import { Mail, MailCheck } from 'lucide-react'
import { errorMessage } from '../../lib/http/apiClient'
import { authRepository } from '../../repositories/authRepository'
import type { AuthResponse, OtpChallenge } from '../../types/api'
import { href } from '../../utils/router'
import { AuthHeading } from './AuthHeading'
import { Field } from './Field'
import { FormAlert, SubmitButton } from './FormBits'
import { OtpPanel } from './OtpPanel'
import { validateEmail } from './validation'

export function StepIcon({ icon: Icon = MailCheck }: { icon?: typeof MailCheck }) {
  return (
    <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#173f32] to-[#2a6b55] text-amber-100 shadow-[0_12px_30px_-12px_rgba(23,63,50,0.8)] ring-4 ring-[#D9B27C]/20">
      <Icon size={24} aria-hidden="true" />
    </span>
  )
}

type VerifyEmailStepProps = {
  /** From `?email=`; missing when someone opens #verify-email directly. */
  email: string | null
  challenge: OtpChallenge | null
  notice?: string | null
  next?: string
  onVerified: (response: AuthResponse) => Promise<void>
  onChangeEmail: () => void
  changeEmailLabel?: string
  onCodeRequested: (challenge: OtpChallenge) => void
}

export function VerifyEmailStep(props: VerifyEmailStepProps) {
  if (!props.email) return <RequestVerificationCode next={props.next} onSent={props.onCodeRequested} />
  return <VerifyCodeForm {...props} email={props.email} />
}

function VerifyCodeForm({ email, challenge, notice, next, onVerified, onChangeEmail, changeEmailLabel }: VerifyEmailStepProps & { email: string }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState(0)

  const verify = async (value: string) => {
    if (busy) return
    if (value.length !== 6) {
      setError('Enter all 6 digits of the code')
      setErrorKey((key) => key + 1)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const response = await authRepository.verifyEmail(email, value)
      await onVerified(response)
    } catch (err) {
      setError(errorMessage(err))
      setErrorKey((key) => key + 1)
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void verify(code)
  }

  return (
    <form onSubmit={submit} noValidate className="auth-swap">
      <StepIcon />
      <AuthHeading title="Verify your email">
        {challenge ? 'Enter the 6-digit code we just emailed you. It verifies your address and signs you in.' : 'Enter the 6-digit code from your email, or send yourself a new one.'}
      </AuthHeading>
      <div className="space-y-6">
        {notice && <FormAlert tone="info">{notice}</FormAlert>}
        <OtpPanel
          email={email}
          challenge={challenge}
          code={code}
          onCodeChange={(value) => {
            setCode(value)
            if (error) setError(null)
          }}
          onComplete={verify}
          onResend={() => authRepository.resendOtp(email, 'verify_email')}
          onChangeEmail={onChangeEmail}
          changeEmailLabel={changeEmailLabel}
          error={error}
          errorKey={errorKey}
          disabled={busy}
        />
        <SubmitButton loading={busy} loadingLabel="Verifying…" disabled={code.length < 6}>Verify & continue</SubmitButton>
      </div>
      <p className="mt-7 text-center text-sm text-stone-600 dark:text-stone-400">
        Already verified?{' '}
        <a className="font-bold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200" href={href('login', { next })}>Sign in</a>
      </p>
    </form>
  )
}

/** #verify-email without an address: ask for it, then send a code. */
function RequestVerificationCode({ next, onSent }: { next?: string; onSent: (challenge: OtpChallenge) => void }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (validateEmail(email)) return
    setBusy(true)
    setError(null)
    try {
      onSent(await authRepository.resendOtp(email.trim().toLowerCase(), 'verify_email'))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-swap">
      <StepIcon />
      <AuthHeading title="Verify your email">Enter the email you registered with and we’ll send you a fresh 6-digit code.</AuthHeading>
      <div className="space-y-5">
        {error && <FormAlert>{error}</FormAlert>}
        <Field label="Email" type="email" icon={Mail} autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} error={submitted ? validateEmail(email) : null} required autoFocus />
        <SubmitButton loading={busy} loadingLabel="Sending…">Send code</SubmitButton>
      </div>
      <p className="mt-7 text-center text-sm text-stone-600 dark:text-stone-400">
        <a className="font-bold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200" href={href('login', { next })}>Back to sign in</a>
      </p>
    </form>
  )
}
