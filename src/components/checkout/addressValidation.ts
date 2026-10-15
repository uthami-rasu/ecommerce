import type { AddressFields, UserProfile } from '../../types/api'

export type AddressDraft = Required<Pick<AddressFields, 'firstName' | 'lastName' | 'phone' | 'line1' | 'city' | 'state' | 'postalCode'>> & {
  line2: string
  label: string
}

export type AddressErrors = Partial<Record<keyof AddressDraft, string>>

export const emptyAddress = (user?: UserProfile | null): AddressDraft => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  phone: user?.phone ?? '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  label: '',
})

const PHONE = /^\+?[0-9 ()-]{7,20}$/
const PIN = /^[1-9][0-9]{5}$/

/** Client-side checks mirroring the API's address rules (plus Indian 6-digit PIN & 10-digit mobile). */
export function validateAddress(draft: AddressDraft): AddressErrors {
  const errors: AddressErrors = {}
  if (!draft.firstName.trim()) errors.firstName = 'Enter a first name'
  if (!draft.lastName.trim()) errors.lastName = 'Enter a last name'
  const digits = draft.phone.replace(/\D/g, '')
  if (!draft.phone.trim()) errors.phone = 'Enter a phone number for delivery updates'
  else if (!PHONE.test(draft.phone.trim()) || digits.length < 10 || digits.length > 12) errors.phone = 'Enter a valid 10-digit mobile number'
  if (draft.line1.trim().length < 3) errors.line1 = 'Enter the house number and street'
  if (draft.city.trim().length < 2) errors.city = 'Enter a city or town'
  if (!draft.state.trim()) errors.state = 'Choose a state'
  if (!PIN.test(draft.postalCode.trim())) errors.postalCode = 'Enter a valid 6-digit PIN code'
  return errors
}

/** Trimmed API payload (country is always India for now). */
export const toAddressFields = (draft: AddressDraft): AddressFields => ({
  firstName: draft.firstName.trim(),
  lastName: draft.lastName.trim(),
  phone: draft.phone.trim(),
  line1: draft.line1.trim(),
  line2: draft.line2.trim() || undefined,
  city: draft.city.trim(),
  state: draft.state.trim(),
  postalCode: draft.postalCode.trim(),
  country: 'IN',
})
