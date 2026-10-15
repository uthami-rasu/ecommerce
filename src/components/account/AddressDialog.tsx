import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Building2, Home, MapPin, Phone, Tag, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'
import { Field } from '../auth/Field'
import { FormAlert, SubmitButton } from '../auth/FormBits'
import { validateName, validatePhone } from '../auth/validation'
import { useCreateAddressMutation, useUpdateAddressMutation } from '../../features/account/accountApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Address, AddressInput, UserProfile } from '../../types/api'

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const COUNTRIES = [
  ['IN', 'India'], ['AE', 'United Arab Emirates'], ['SG', 'Singapore'], ['GB', 'United Kingdom'], ['US', 'United States'],
  ['CA', 'Canada'], ['AU', 'Australia'],
] as const

const LABEL_PRESETS = [
  { label: 'Home', icon: Home },
  { label: 'Work', icon: Building2 },
]

type Values = {
  label: string; firstName: string; lastName: string; phone: string; line1: string; line2: string
  city: string; state: string; postalCode: string; country: string; isDefaultShipping: boolean; isDefaultBilling: boolean
}

const fromAddress = (address: Address | null, user: UserProfile, isFirst: boolean): Values => ({
  label: address?.label ?? (address ? '' : 'Home'),
  firstName: address?.firstName ?? user.firstName,
  lastName: address?.lastName ?? user.lastName,
  phone: address?.phone ?? user.phone ?? '',
  line1: address?.line1 ?? '',
  line2: address?.line2 ?? '',
  city: address?.city ?? '',
  state: address?.state ?? '',
  postalCode: address?.postalCode ?? '',
  country: address?.country ?? 'IN',
  isDefaultShipping: address?.isDefaultShipping ?? isFirst,
  isDefaultBilling: address?.isDefaultBilling ?? isFirst,
})

const validate = (values: Values) => {
  const between = (value: string, min: number, max: number, message: string) => {
    const length = value.trim().length
    return length < min || length > max ? message : null
  }
  const india = values.country === 'IN'
  const pin = values.postalCode.trim()
  return {
    label: values.label.trim().length > 40 ? 'Label must be 40 characters or fewer' : null,
    firstName: validateName(values.firstName, 'first name'),
    lastName: validateName(values.lastName, 'last name'),
    phone: validatePhone(values.phone, true),
    line1: between(values.line1, 3, 200, 'Enter the house / flat number and street (3–200 characters)'),
    line2: values.line2.trim().length > 200 ? 'Must be 200 characters or fewer' : null,
    city: between(values.city, 2, 100, 'Enter the city or town'),
    state: between(values.state, 2, 100, india ? 'Choose a state or union territory' : 'Enter the state or region'),
    postalCode: india
      ? /^[1-9]\d{5}$/.test(pin) ? null : 'Enter a valid 6-digit PIN code'
      : /^[A-Za-z0-9 -]{3,12}$/.test(pin) ? null : 'Enter a valid postal code',
  }
}

function Toggle({ checked, onChange, children, disabled }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${checked ? 'border-[#173f32]/40 bg-[#173f32]/5 dark:border-amber-200/30 dark:bg-amber-200/5' : 'border-stone-200 dark:border-stone-700'} ${disabled ? 'opacity-70' : 'cursor-pointer hover:border-[#173f32]/30'}`}>
      <input type="checkbox" className="size-4 accent-[#173f32]" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span className="font-medium text-stone-700 dark:text-stone-200">{children}</span>
    </label>
  )
}

type AddressDialogProps = { address: Address | null; user: UserProfile; isFirst: boolean; onClose: () => void }

/** Add / edit an address in a modal sheet. */
export function AddressDialog({ address, user, isFirst, onClose }: AddressDialogProps) {
  const [values, setValues] = useState(() => fromAddress(address, user, isFirst))
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [create, createState] = useCreateAddressMutation()
  const [update, updateState] = useUpdateAddressMutation()
  const saving = createState.isLoading || updateState.isLoading
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const errors = validate(values)
  const shown = (key: keyof typeof errors) => (submitted ? errors[key] : null)
  const set = (key: keyof Values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [key]: event.target.value }))
  const india = values.country === 'IN'

  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    window.lenis?.stop()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key === 'Tab' && panel.current) {
        // Keep keyboard focus inside the dialog.
        const focusable = panel.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      window.lenis?.start()
      opener?.focus?.()
    }
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (Object.values(errors).some(Boolean)) return
    const input: AddressInput = {
      label: values.label.trim() || undefined,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      line1: values.line1.trim(),
      line2: values.line2.trim() || null,
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim().toUpperCase(),
      country: values.country,
      isDefaultShipping: values.isDefaultShipping,
      isDefaultBilling: values.isDefaultBilling,
    }
    try {
      if (address) await update({ id: address.id, ...input }).unwrap()
      else await create(input).unwrap()
      toast.success(address ? 'Address updated' : 'Address added')
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return createPortal(
    <div className="account-root fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div className="account-dialog-backdrop absolute inset-0 bg-stone-950/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="account-dialog-panel relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-[#fffefa] shadow-2xl sm:rounded-[28px] dark:border-stone-800 dark:bg-stone-900"
      >
        <header className="flex items-center justify-between gap-4 border-b border-stone-200/70 px-5 py-4 sm:px-7 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#173f32] text-amber-100"><MapPin size={18} /></span>
            <h2 id={titleId} className="font-display text-2xl font-bold text-[#173f32] dark:text-stone-50">{address ? 'Edit address' : 'New address'}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/30 dark:hover:bg-stone-800 dark:hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div data-lenis-prevent className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            {error && <FormAlert>{error}</FormAlert>}

            <fieldset>
              <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-600 dark:text-stone-300">Label</legend>
              <div className="flex flex-wrap items-end gap-2">
                {LABEL_PRESETS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={values.label === label}
                    onClick={() => setValues((current) => ({ ...current, label }))}
                    className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${values.label === label ? 'border-[#173f32] bg-[#173f32] text-white dark:border-amber-200/50 dark:bg-amber-200/15 dark:text-amber-100' : 'border-stone-200 text-stone-600 hover:border-[#173f32]/40 dark:border-stone-700 dark:text-stone-300'}`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
                <Field className="min-w-[10rem] flex-1" label="Custom label" icon={Tag} placeholder="e.g. Parents’ home" value={LABEL_PRESETS.some((preset) => preset.label === values.label) ? '' : values.label} onChange={set('label')} error={shown('label')} maxLength={40} />
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" icon={UserRound} autoComplete="given-name" value={values.firstName} onChange={set('firstName')} error={shown('firstName')} maxLength={80} required autoFocus />
              <Field label="Last name" autoComplete="family-name" value={values.lastName} onChange={set('lastName')} error={shown('lastName')} maxLength={80} required />
              <Field className="sm:col-span-2" label="Phone" type="tel" icon={Phone} autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" value={values.phone} onChange={set('phone')} error={shown('phone')} hint="The courier may call this number for delivery." required />
              <Field className="sm:col-span-2" label="Address line 1" autoComplete="address-line1" placeholder="House / flat no., building, street" value={values.line1} onChange={set('line1')} error={shown('line1')} maxLength={200} required />
              <Field className="sm:col-span-2" label="Address line 2" autoComplete="address-line2" placeholder="Area, landmark (optional)" value={values.line2} onChange={set('line2')} error={shown('line2')} maxLength={200} />
              <Field label="City" autoComplete="address-level2" value={values.city} onChange={set('city')} error={shown('city')} maxLength={100} required />
              <Field
                label={india ? 'PIN code' : 'Postal code'}
                autoComplete="postal-code"
                inputMode={india ? 'numeric' : 'text'}
                placeholder={india ? '628501' : ''}
                maxLength={india ? 6 : 12}
                value={values.postalCode}
                onChange={set('postalCode')}
                error={shown('postalCode')}
                hint={india ? 'Indian PIN codes have 6 digits.' : undefined}
                required
              />
              <Field label={india ? 'State / UT' : 'State / region'} autoComplete="address-level1" list={india ? 'account-indian-states' : undefined} value={values.state} onChange={set('state')} error={shown('state')} maxLength={100} required />
              <div>
                <label htmlFor="account-address-country" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-stone-600 dark:text-stone-300">Country</label>
                <select
                  id="account-address-country"
                  autoComplete="country"
                  value={values.country}
                  onChange={set('country')}
                  className="h-12 w-full rounded-xl border border-stone-200 bg-white/80 px-4 text-[15px] text-stone-900 outline-none transition focus:border-[#D9B27C] focus:ring-4 focus:ring-[#D9B27C]/20 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-100"
                >
                  {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </div>
            </div>
            <datalist id="account-indian-states">
              {INDIAN_STATES.map((state) => <option key={state} value={state} />)}
            </datalist>

            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle checked={values.isDefaultShipping} onChange={(value) => setValues((current) => ({ ...current, isDefaultShipping: value }))} disabled={address?.isDefaultShipping}>
                Default shipping address
              </Toggle>
              <Toggle checked={values.isDefaultBilling} onChange={(value) => setValues((current) => ({ ...current, isDefaultBilling: value }))} disabled={address?.isDefaultBilling}>
                Default billing address
              </Toggle>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-stone-200/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7 dark:border-stone-800">
            <button type="button" onClick={onClose} className="h-12 rounded-full px-6 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800">Cancel</button>
            <SubmitButton loading={saving} loadingLabel="Saving…" arrow={false} className="sm:w-auto sm:px-8">{address ? 'Save address' : 'Add address'}</SubmitButton>
          </footer>
        </form>
      </div>
    </div>
  , document.body)
}
