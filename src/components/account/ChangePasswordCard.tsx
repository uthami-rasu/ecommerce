import { useState, type FormEvent } from 'react'
import { LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { PasswordField } from '../auth/Field'
import { FormAlert, SubmitButton } from '../auth/FormBits'
import { PasswordStrength } from '../auth/PasswordStrength'
import { validateConfirm, validatePassword } from '../auth/validation'
import { useChangePasswordMutation } from '../../features/account/accountApi'
import { completeSignIn } from '../../features/auth/authSlice'
import { errorMessage, isApiError } from '../../lib/http/apiClient'
import { AccountSection } from './AccountSection'

const EMPTY = { current: '', next: '', repeat: '' }

export function ChangePasswordCard() {
  const dispatch = useAppDispatch()
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [values, setValues] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const errors = {
    current: values.current ? currentError : 'Enter your current password',
    next: validatePassword(values.next) ?? (values.next && values.next === values.current ? 'Choose a password different from the current one' : null),
    repeat: validateConfirm(values.next, values.repeat),
  }
  const set = (key: keyof typeof EMPTY) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [key]: event.target.value }))
    if (key === 'current') setCurrentError(null)
    setDone(false)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (Object.values(errors).some(Boolean)) return
    try {
      const response = await changePassword({ currentPassword: values.current, newPassword: values.next }).unwrap()
      await dispatch(completeSignIn(response)).unwrap()
      setValues(EMPTY)
      setSubmitted(false)
      setDone(true)
      toast.success('Password changed', { description: 'You’ve been signed out on your other devices.' })
    } catch (err) {
      if (isApiError(err) && (err.status === 401 || err.status === 403)) setCurrentError('Your current password is incorrect')
      else setError(errorMessage(err))
    }
  }

  return (
    <AccountSection title="Password" description="Changing your password signs you out everywhere else; this device stays signed in.">
      <form onSubmit={submit} noValidate className="max-w-xl space-y-5">
        {error && <FormAlert>{error}</FormAlert>}
        {done && <FormAlert tone="success">Password updated. Any other sessions have been signed out.</FormAlert>}
        <PasswordField label="Current password" icon={LockKeyhole} autoComplete="current-password" value={values.current} onChange={set('current')} error={submitted || currentError ? errors.current : null} required />
        <div>
          <PasswordField label="New password" icon={LockKeyhole} autoComplete="new-password" value={values.next} onChange={set('next')} error={submitted ? errors.next : null} maxLength={128} required />
          {values.next && <PasswordStrength password={values.next} />}
        </div>
        <PasswordField label="Repeat new password" icon={LockKeyhole} autoComplete="new-password" value={values.repeat} onChange={set('repeat')} error={submitted ? errors.repeat : null} maxLength={128} required />
        <SubmitButton loading={isLoading} loadingLabel="Updating…" arrow={false} className="sm:w-auto sm:px-8">Update password</SubmitButton>
      </form>
    </AccountSection>
  )
}
