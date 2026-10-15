import { useState, type FormEvent } from 'react'
import { Mail, Phone, RotateCcw, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { Field } from '../auth/Field'
import { FormAlert, SubmitButton } from '../auth/FormBits'
import { validateName, validatePhone } from '../auth/validation'
import { useUpdateProfileMutation } from '../../features/account/accountApi'
import { userUpdated } from '../../features/auth/authSlice'
import { errorMessage } from '../../lib/http/apiClient'
import type { UpdateProfileInput, UserProfile } from '../../types/api'
import { AccountSection, SecondaryButton } from './AccountSection'

type Values = { firstName: string; lastName: string; displayName: string; phone: string }

const valuesOf = (user: UserProfile): Values => ({
  firstName: user.firstName,
  lastName: user.lastName,
  displayName: user.displayName ?? '',
  phone: user.phone ?? '',
})

/** Remounted (key) whenever the saved profile changes, so the form always starts from the server state. */
export function ProfileTab({ user }: { user: UserProfile }) {
  const dispatch = useAppDispatch()
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const initial = valuesOf(user)
  const [values, setValues] = useState(initial)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const errors = {
    firstName: validateName(values.firstName, 'first name'),
    lastName: validateName(values.lastName, 'last name'),
    displayName: values.displayName.trim().length > 80 ? 'Display name must be 80 characters or fewer' : null,
    phone: validatePhone(values.phone),
  }
  const changed = (Object.keys(values) as Array<keyof Values>).filter((key) => values[key].trim() !== initial[key])
  const dirty = changed.length > 0
  const set = (key: keyof Values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (!dirty || Object.values(errors).some(Boolean)) return
    const patch: UpdateProfileInput = {}
    for (const key of changed) {
      const value = values[key].trim()
      if (key === 'displayName' || key === 'phone') patch[key] = value || null
      else patch[key] = value
    }
    try {
      const profile = await updateProfile(patch).unwrap()
      dispatch(userUpdated(profile))
      toast.success('Profile saved')
    } catch (err) {
      setError(errorMessage(err))
      toast.error('Could not save your profile', { description: errorMessage(err) })
    }
  }

  return (
    <AccountSection title="Profile" description="Your name and contact details, used for orders and reviews.">
      <form onSubmit={submit} noValidate className="space-y-6">
        {error && <FormAlert>{error}</FormAlert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" icon={UserRound} autoComplete="given-name" value={values.firstName} onChange={set('firstName')} error={submitted ? errors.firstName : null} maxLength={80} required />
          <Field label="Last name" autoComplete="family-name" value={values.lastName} onChange={set('lastName')} error={submitted ? errors.lastName : null} maxLength={80} required />
          <Field
            className="sm:col-span-2"
            label="Display name"
            autoComplete="nickname"
            placeholder={`${values.firstName} ${values.lastName.charAt(0)}.`.trim()}
            value={values.displayName}
            onChange={set('displayName')}
            error={submitted ? errors.displayName : null}
            hint="Shown in your account and next to your product reviews. Leave empty to use your name."
            maxLength={80}
          />
          <Field
            label="Phone"
            type="tel"
            icon={Phone}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            value={values.phone}
            onChange={set('phone')}
            error={submitted || values.phone ? errors.phone : null}
          />
          <Field
            label="Email"
            type="email"
            icon={Mail}
            value={user.email}
            readOnly
            disabled
            hint={<>Change it under <a className="font-semibold text-[#173f32] underline-offset-2 hover:underline dark:text-amber-200" href="#account/security">Security</a>.</>}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-stone-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400" aria-live="polite">
            {dirty ? `${changed.length} unsaved change${changed.length > 1 ? 's' : ''}` : 'All changes saved'}
          </p>
          <div className="flex gap-3">
            <SecondaryButton onClick={() => { setValues(initial); setSubmitted(false); setError(null) }} disabled={!dirty || isLoading} className="h-12 px-5">
              <RotateCcw size={15} /> Discard
            </SecondaryButton>
            <SubmitButton loading={isLoading} loadingLabel="Saving…" disabled={!dirty} arrow={false} className="w-auto px-8">
              Save changes
            </SubmitButton>
          </div>
        </div>
      </form>
    </AccountSection>
  )
}
