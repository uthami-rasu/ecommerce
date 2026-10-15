import { useState, type FormEvent } from 'react'
import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { errorMessage, isApiError } from '../../lib/http/apiClient'
import { authRepository } from '../../repositories/authRepository'
import type { OtpChallenge, RegisterInput } from '../../types/api'
import { href } from '../../utils/router'
import { AuthHeading, ModeSwitch } from './AuthHeading'
import { Field, PasswordField } from './Field'
import { FormAlert, SubmitButton } from './FormBits'
import { PasswordStrength } from './PasswordStrength'
import { validateConfirm, validateEmail, validateName, validatePassword } from './validation'

export type RegisterDraft = Omit<RegisterInput, 'password'>

type RegisterFormProps = {
  next?: string
  draft?: RegisterDraft
  onChallenge: (challenge: OtpChallenge, draft: RegisterDraft) => void
}

export function RegisterForm({ next, draft, onChallenge }: RegisterFormProps) {
  const [values, setValues] = useState({
    firstName: draft?.firstName ?? '',
    lastName: draft?.lastName ?? '',
    email: draft?.email ?? '',
    password: '',
    confirm: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ message: string; exists?: boolean } | null>(null)

  const errors = {
    firstName: validateName(values.firstName, 'first name'),
    lastName: validateName(values.lastName, 'last name'),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirm: validateConfirm(values.password, values.confirm),
  }
  const shown = (key: keyof typeof errors) => (submitted ? errors[key] : null)
  const set = (key: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (Object.values(errors).some(Boolean)) return
    const input: RegisterInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    }
    setBusy(true)
    try {
      const challenge = await authRepository.register(input)
      onChallenge(challenge, { firstName: input.firstName, lastName: input.lastName, email: input.email })
    } catch (err) {
      setError(
        isApiError(err) && err.status === 409
          ? { message: 'An account with this email already exists.', exists: true }
          : { message: errorMessage(err) },
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-swap">
      <ModeSwitch mode="register" next={next} />
      <AuthHeading title="Create your account">It takes less than a minute — we’ll confirm your email with a 6-digit code.</AuthHeading>

      <div className="space-y-5">
        {error && (
          <FormAlert>
            {error.message}
            {error.exists && (
              <>
                {' '}
                <a className="font-bold underline underline-offset-2" href={href('login', { next })}>Sign in instead</a> or{' '}
                <a className="font-bold underline underline-offset-2" href={href('forgot-password', { next, email: values.email.trim() })}>reset your password</a>.
              </>
            )}
          </FormAlert>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" icon={UserRound} autoComplete="given-name" placeholder="Anita" value={values.firstName} onChange={set('firstName')} error={shown('firstName')} maxLength={80} required autoFocus />
          <Field label="Last name" autoComplete="family-name" placeholder="Thomas" value={values.lastName} onChange={set('lastName')} error={shown('lastName')} maxLength={80} required />
        </div>
        <Field label="Email" type="email" icon={Mail} autoComplete="email" inputMode="email" placeholder="you@example.com" value={values.email} onChange={set('email')} error={shown('email')} required />
        <div>
          <PasswordField
            label="Password"
            icon={LockKeyhole}
            autoComplete="new-password"
            placeholder="Create a password"
            value={values.password}
            onChange={set('password')}
            error={shown('password')}
            maxLength={128}
            required
          />
          <PasswordStrength password={values.password} />
        </div>
        <PasswordField
          label="Confirm password"
          icon={LockKeyhole}
          autoComplete="new-password"
          placeholder="Repeat the password"
          value={values.confirm}
          onChange={set('confirm')}
          error={shown('confirm')}
          hint={values.confirm && !errors.confirm ? <span className="font-semibold text-emerald-700 dark:text-emerald-400">Passwords match</span> : undefined}
          maxLength={128}
          required
        />
        <SubmitButton loading={busy} loadingLabel="Creating account…">Create account</SubmitButton>
      </div>

      <p className="mt-7 text-center text-sm text-stone-600 dark:text-stone-400">
        Already have an account?{' '}
        <a className="font-bold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200" href={href('login', { next })}>
          Sign in
        </a>
      </p>
    </form>
  )
}
