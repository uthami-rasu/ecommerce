import { useRef, useState, type FormEvent } from 'react'
import { KeyRound, LockKeyhole, Mail } from 'lucide-react'
import { errorMessage } from '../../lib/http/apiClient'
import { authRepository } from '../../repositories/authRepository'
import type { AuthResponse, OtpChallenge } from '../../types/api'
import { href } from '../../utils/router'
import { AuthHeading } from './AuthHeading'
import { Field, PasswordField } from './Field'
import { FormAlert, SubmitButton } from './FormBits'
import { OtpPanel } from './OtpPanel'
import { PasswordStrength } from './PasswordStrength'
import { isCodeError, validateConfirm, validateEmail, validatePassword } from './validation'
import { StepIcon } from './VerifyEmailStep'

type ForgotPasswordFlowProps = {
  next?: string
  initialEmail?: string
  onReset: (response: AuthResponse) => Promise<void>
}

/** Step 1: email → code. Step 2: code + new password → signed in. */
export function ForgotPasswordFlow({ next, initialEmail = '', onReset }: ForgotPasswordFlowProps) {
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null)
  const [email, setEmail] = useState(initialEmail)

  if (challenge) {
    return <ResetPasswordForm key={challenge.email} challenge={challenge} next={next} onReset={onReset} onChangeEmail={() => setChallenge(null)} />
  }
  return <RequestResetForm email={email} onEmailChange={setEmail} next={next} onSent={setChallenge} />
}

function RequestResetForm({ email, onEmailChange, next, onSent }: { email: string; onEmailChange: (email: string) => void; next?: string; onSent: (challenge: OtpChallenge) => void }) {
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
      onSent(await authRepository.forgotPassword(email.trim().toLowerCase()))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-swap">
      <StepIcon icon={KeyRound} />
      <AuthHeading title="Forgot your password?">Enter your account email. If it’s registered with us, we’ll send a 6-digit code to reset your password.</AuthHeading>
      <div className="space-y-5">
        {error && <FormAlert>{error}</FormAlert>}
        <Field label="Email" type="email" icon={Mail} autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(event) => onEmailChange(event.target.value)} error={submitted ? validateEmail(email) : null} required autoFocus />
        <SubmitButton loading={busy} loadingLabel="Sending code…">Send reset code</SubmitButton>
      </div>
      <p className="mt-7 text-center text-sm text-stone-600 dark:text-stone-400">
        Remembered it?{' '}
        <a className="font-bold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200" href={href('login', { next })}>Back to sign in</a>
      </p>
    </form>
  )
}

function ResetPasswordForm({ challenge, next, onReset, onChangeEmail }: { challenge: OtpChallenge; next?: string; onReset: (response: AuthResponse) => Promise<void>; onChangeEmail: () => void }) {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const passwordError = validatePassword(password)
  const confirmError = validateConfirm(password, confirm)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (code.length !== 6) {
      setCodeError('Enter all 6 digits of the code')
      setErrorKey((key) => key + 1)
      return
    }
    if (passwordError || confirmError) return
    setBusy(true)
    try {
      const response = await authRepository.resetPassword({ email: challenge.email, code, newPassword: password })
      await onReset(response)
    } catch (err) {
      const message = errorMessage(err)
      if (isCodeError(message)) {
        setCodeError(message)
        setErrorKey((key) => key + 1)
        setCode('')
      } else {
        setError(message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-swap">
      <StepIcon icon={KeyRound} />
      <AuthHeading title="Set a new password">If an account exists for this email, a 6-digit code is on its way. Enter it with your new password.</AuthHeading>
      <div className="space-y-6">
        {error && <FormAlert>{error}</FormAlert>}
        <OtpPanel
          email={challenge.email}
          challenge={challenge}
          code={code}
          onCodeChange={(value) => {
            setCode(value)
            if (codeError) setCodeError(null)
          }}
          onComplete={() => passwordRef.current?.focus()}
          onResend={() => authRepository.resendOtp(challenge.email, 'reset_password')}
          onChangeEmail={onChangeEmail}
          error={codeError}
          errorKey={errorKey}
          disabled={busy}
        />
        <div>
          <PasswordField
            ref={passwordRef}
            label="New password"
            icon={LockKeyhole}
            autoComplete="new-password"
            placeholder="Create a new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={submitted ? passwordError : null}
            maxLength={128}
            required
          />
          <PasswordStrength password={password} />
        </div>
        <PasswordField
          label="Confirm new password"
          icon={LockKeyhole}
          autoComplete="new-password"
          placeholder="Repeat the new password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={submitted ? confirmError : null}
          maxLength={128}
          required
        />
        <SubmitButton loading={busy} loadingLabel="Updating password…">Reset password & sign in</SubmitButton>
      </div>
      <p className="mt-7 text-center text-sm text-stone-600 dark:text-stone-400">
        <a className="font-bold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200" href={href('login', { next })}>Back to sign in</a>
      </p>
    </form>
  )
}
