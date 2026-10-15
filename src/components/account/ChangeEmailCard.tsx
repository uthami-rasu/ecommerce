import { useState, type FormEvent } from 'react'
import { AtSign, LockKeyhole, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { Field, PasswordField } from '../auth/Field'
import { FormAlert, SubmitButton } from '../auth/FormBits'
import { OtpPanel } from '../auth/OtpPanel'
import { validateEmail } from '../auth/validation'
import { useConfirmEmailChangeMutation, useRequestEmailChangeMutation } from '../../features/account/accountApi'
import { userUpdated } from '../../features/auth/authSlice'
import { errorMessage, isApiError } from '../../lib/http/apiClient'
import type { OtpChallenge, UserProfile } from '../../types/api'
import { AccountSection, SecondaryButton } from './AccountSection'

type FieldErrors = { email?: string | null; password?: string | null; general?: string | null }

/** New email + password → code sent to the new address → confirm. */
export function ChangeEmailCard({ user }: { user: UserProfile }) {
  const dispatch = useAppDispatch()
  const [requestChange, request] = useRequestEmailChangeMutation()
  const [confirmChange, confirm] = useConfirmEmailChangeMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [challenge, setChallenge] = useState<{ value: OtpChallenge; stamp: number } | null>(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState(0)

  const newEmail = email.trim().toLowerCase()
  const emailError = validateEmail(email) ?? (newEmail === user.email ? 'This is already your email address' : null)

  const send = async () => {
    try {
      return await requestChange({ newEmail, password }).unwrap()
    } catch (err) {
      // Shaped like ApiErrorShape so errorMessage() can read it, plus the field it belongs to.
      if (isApiError(err) && err.status === 401) throw { status: 401, field: 'password', message: 'Your current password is incorrect' }
      if (isApiError(err) && err.status === 409) throw { status: 409, field: 'email', message: 'That email is already used by another account' }
      throw { status: isApiError(err) ? err.status : 0, field: 'general', message: errorMessage(err) }
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setErrors({})
    if (emailError || !password) return
    try {
      const value = await send()
      setChallenge({ value, stamp: Date.now() })
      setCode('')
      setCodeError(null)
    } catch (err) {
      const { field, message } = err as { field: keyof FieldErrors; message: string }
      setErrors({ [field]: message })
    }
  }

  const verify = async (value: string) => {
    if (confirm.isLoading) return
    if (value.length !== 6) {
      setCodeError('Enter all 6 digits of the code')
      setErrorKey((key) => key + 1)
      return
    }
    try {
      const profile = await confirmChange(value).unwrap()
      dispatch(userUpdated(profile))
      toast.success('Email updated', { description: `You’ll now sign in with ${profile.email}` })
      reset()
    } catch (err) {
      if (isApiError(err) && err.status === 409) {
        setChallenge(null)
        setErrors({ email: 'That email was just taken by another account' })
        return
      }
      setCodeError(errorMessage(err))
      setErrorKey((key) => key + 1)
      setCode('')
    }
  }

  const reset = () => {
    setChallenge(null)
    setEmail('')
    setPassword('')
    setSubmitted(false)
    setErrors({})
    setCode('')
    setCodeError(null)
  }

  return (
    <AccountSection
      title="Email address"
      description={<>You sign in with <strong className="font-semibold text-stone-700 dark:text-stone-200">{user.email}</strong>. We’ll send a code to the new address to confirm it’s yours.</>}
      actions={challenge && (
        <SecondaryButton onClick={reset}>
          <X size={15} /> Cancel
        </SecondaryButton>
      )}
    >
      {challenge ? (
        <form
          className="account-swap max-w-md space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void verify(code)
          }}
        >
          <OtpPanel
            key={challenge.stamp}
            email={challenge.value.email}
            challenge={challenge.value}
            code={code}
            onCodeChange={(value) => {
              setCode(value)
              if (codeError) setCodeError(null)
            }}
            onComplete={verify}
            onResend={send}
            onChangeEmail={() => setChallenge(null)}
            error={codeError}
            errorKey={errorKey}
            disabled={confirm.isLoading}
          />
          <SubmitButton loading={confirm.isLoading} loadingLabel="Confirming…" disabled={code.length < 6} arrow={false}>Confirm new email</SubmitButton>
        </form>
      ) : (
        <form onSubmit={submit} noValidate className="max-w-xl space-y-5">
          {errors.general && <FormAlert>{errors.general}</FormAlert>}
          <Field
            label="New email"
            type="email"
            icon={AtSign}
            autoComplete="email"
            inputMode="email"
            placeholder="new@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setErrors((current) => ({ ...current, email: null }))
            }}
            error={errors.email ?? (submitted ? emailError : null)}
            required
          />
          <PasswordField
            label="Current password"
            icon={LockKeyhole}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setErrors((current) => ({ ...current, password: null }))
            }}
            error={errors.password ?? (submitted && !password ? 'Enter your current password' : null)}
            hint="For your security we ask for your password before changing the email."
            required
          />
          <SubmitButton loading={request.isLoading} loadingLabel="Sending code…" className="sm:w-auto sm:px-8">Send verification code</SubmitButton>
        </form>
      )}
    </AccountSection>
  )
}
