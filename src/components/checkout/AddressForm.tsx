import type { AddressDraft, AddressErrors } from './addressValidation'
import { INDIAN_STATES } from './checkoutConstants'
import { FormField } from './FormField'
import { inputBorder, inputClass } from './formStyles'

type AddressFormProps = {
  idPrefix: string
  value: AddressDraft
  errors: AddressErrors
  onChange: (value: AddressDraft) => void
  showLabel?: boolean
}

/** Indian postal address fields (name, phone, street, city, state, PIN). */
export function AddressForm({ idPrefix, value, errors, onChange, showLabel }: AddressFormProps) {
  const field = (key: keyof AddressDraft) => ({
    id: `${idPrefix}-${key}`,
    value: value[key],
    onChange: (event: { target: { value: string } }) => onChange({ ...value, [key]: event.target.value }),
    'aria-invalid': Boolean(errors[key]) || undefined,
    'aria-describedby': errors[key] ? `${idPrefix}-${key}-error` : undefined,
    className: `${inputClass} ${inputBorder(Boolean(errors[key]))}`,
  })

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id={`${idPrefix}-firstName`} label="First name" error={errors.firstName}>
        <input {...field('firstName')} autoComplete="given-name" required maxLength={80} />
      </FormField>
      <FormField id={`${idPrefix}-lastName`} label="Last name" error={errors.lastName}>
        <input {...field('lastName')} autoComplete="family-name" required maxLength={80} />
      </FormField>
      <FormField id={`${idPrefix}-phone`} label="Mobile number" error={errors.phone} hint="For delivery updates from the courier" className="sm:col-span-2">
        <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" required maxLength={20} />
      </FormField>
      <FormField id={`${idPrefix}-line1`} label="House no. & street" error={errors.line1} className="sm:col-span-2">
        <input {...field('line1')} autoComplete="address-line1" placeholder="Flat / house no., building, street" required maxLength={200} />
      </FormField>
      <FormField id={`${idPrefix}-line2`} label="Area / landmark" optional className="sm:col-span-2">
        <input {...field('line2')} autoComplete="address-line2" placeholder="Locality, landmark" maxLength={200} />
      </FormField>
      <FormField id={`${idPrefix}-city`} label="Town / city" error={errors.city}>
        <input {...field('city')} autoComplete="address-level2" required maxLength={100} />
      </FormField>
      <FormField id={`${idPrefix}-postalCode`} label="PIN code" error={errors.postalCode}>
        <input
          {...field('postalCode')}
          onChange={(event) => onChange({ ...value, postalCode: event.target.value.replace(/\D/g, '').slice(0, 6) })}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="6-digit PIN"
          required
        />
      </FormField>
      <FormField id={`${idPrefix}-state`} label="State" error={errors.state}>
        <select {...field('state')} autoComplete="address-level1" required>
          <option value="" disabled>Choose a state</option>
          {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
      </FormField>
      <FormField id={`${idPrefix}-country`} label="Country">
        <input id={`${idPrefix}-country`} value="India" readOnly className={`${inputClass} ${inputBorder(false)} cursor-not-allowed bg-stone-50 text-stone-500 dark:bg-stone-900`} />
      </FormField>
      {showLabel && (
        <FormField id={`${idPrefix}-label`} label="Save as" optional hint="e.g. Home, Office" className="sm:col-span-2">
          <input {...field('label')} maxLength={40} placeholder="Home" />
        </FormField>
      )}
    </div>
  )
}
