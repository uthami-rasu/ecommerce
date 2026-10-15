/** Client-side checks that mirror the API's DTO rules (auth.dto.ts / update-profile.dto.ts). */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const validateEmail = (email: string): string | null => {
  const value = email.trim()
  if (!value) return 'Enter your email address'
  if (value.length > 254 || !EMAIL_PATTERN.test(value)) return 'Enter a valid email address'
  return null
}

export const validateName = (value: string, label: string): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return `Enter your ${label}`
  if (trimmed.length > 80) return `${label.charAt(0).toUpperCase()}${label.slice(1)} must be 80 characters or fewer`
  return null
}

export type PasswordCheck = { label: string; ok: boolean }

export const passwordChecks = (password: string): PasswordCheck[] => [
  { label: '8–128 characters', ok: password.length >= 8 && password.length <= 128 },
  { label: 'At least one letter', ok: /[A-Za-z]/.test(password) },
  { label: 'At least one number', ok: /\d/.test(password) },
]

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Enter a password'
  return passwordChecks(password).every((check) => check.ok)
    ? null
    : 'Use 8–128 characters with at least one letter and one number'
}

export const validateConfirm = (password: string, confirm: string): string | null => {
  if (!confirm) return 'Repeat the password'
  return confirm === password ? null : 'Passwords do not match'
}

/** 0–4: purely a guide for the meter; the API only enforces the rules above. */
export const passwordStrength = (password: string): number => {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++
  if (!passwordChecks(password).every((check) => check.ok)) score = Math.min(score, 1)
  return score
}

export const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/

export const validatePhone = (phone: string, required = false): string | null => {
  const value = phone.trim()
  if (!value) return required ? 'Enter a phone number' : null
  return PHONE_PATTERN.test(value) ? null : 'Enter a valid phone number, e.g. +91 98765 43210'
}

/** Code errors from verify / reset / email-change come back as 400 with these messages. */
export const isCodeError = (message: string) => /code|attempt/i.test(message)
