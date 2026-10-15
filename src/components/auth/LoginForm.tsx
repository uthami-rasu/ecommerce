import { useState, type FormEvent } from 'react'
import { LockKeyhole, Mail } from 'lucide-react'
import { errorMessage, isApiError } from '../../lib/http/apiClient'
import { authRepository } from '../../repositories/authRepository'
import type { AuthResponse } from '../../types/api'
import { href } from '../../utils/router'
import { AuthHeading, ModeSwitch } from './AuthHeading'
import { Field, PasswordField } from './Field'
import { FormAlert, SubmitButton } from './FormBits'
import { validateEmail } from './validation'

type LoginFormProps = {
  next?: string
  initialEmail?: string
  onSignedIn: (response: AuthResponse) => Promise<void>
  /** Right password, unverified email: the API has just sent a verification code. */
  onUnverified: (email: string) => void
}

export function LoginForm({ next, initialEmail = '', onSignedIn, onUnverified }: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailError = submitted ? validateEmail(email) : null
  const passwordError = submitted && !password ? 'Enter your password' : null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (validateEmail(email) || !password) return
    setBusy(true)
    try {
      const response = await authRepository.login({ email: email.trim().toLowerCase(), password })
      await onSignedIn(response)
    } catch (err) {
      if (isApiError(err) && err.status === 403 && err.code === 'EMAIL_NOT_VERIFIED') {
        const target = typeof err.details?.email === 'string' ? err.details.email : email.trim().toLowerCase()
        onUnverified(target)
        return
      }
      setError(
        isApiError(err) && err.status === 401
          ? 'That email and password combination didn’t work. Check them and try again.'
          : errorMessage(err),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-swap">
      <ModeSwitch mode="login" next={next} />
      <AuthHeading title="Welcome back">Sign in to your Bossco account to continue.</AuthHeading>

      <div className="space-y-5">
        {error && <FormAlert>{error}</FormAlert>}
        <Field
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
          autoFocus={!initialEmail}
          required
        />
        <PasswordField
          label="Password"
          icon={LockKeyhole}
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
          autoFocus={Boolean(initialEmail)}
          required
          aside={
            <a
              href={href('forgot-password', { next, email: email.trim() || undefined })}
              className="rounded text-xs font-semibold text-[#aa753a] underline-offset-4 hover:text-[#173f32] hover:underline focus-visible:outline-2 focus-visible:outline-[#D9B27C] dark:text-[#e4c08d] dark:hover:text-white"
            >
              Forgot password?
            </a>
          }
        />
        <SubmitButton loading={busy} loadingLabel="Signing in…">Sign in</SubmitButton>
      </div>

      <p className="mt-7 text-center text-sm text-stone-600 dark:text-stone-400">
        New to Bossco?{' '}
        <a className="font-bold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200" href={href('register', { next })}>
          Create an account
        </a>
      </p>
    </form>
  )
}
