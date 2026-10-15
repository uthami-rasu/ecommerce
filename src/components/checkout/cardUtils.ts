/** Formatting & checks for the simulated card form (no real card data ever leaves the page). */

export const TEST_CARD_NUMBER = '4111 1111 1111 1111'

export const formatCardNumber = (raw: string) =>
  raw.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')

export const formatExpiry = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

/** Twelve months from now, e.g. "10/27". */
export const defaultExpiry = () => {
  const date = new Date()
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String((date.getFullYear() + 1) % 100).padStart(2, '0')}`
}

const luhn = (digits: string) => {
  let sum = 0
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index])
    if (index % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

export type CardDraft = { number: string; name: string; expiry: string; cvv: string }
export type CardErrors = Partial<Record<keyof CardDraft, string>>

export function validateCard(card: CardDraft): CardErrors {
  const errors: CardErrors = {}
  const digits = card.number.replace(/\D/g, '')
  if (digits.length !== 16 || !luhn(digits)) errors.number = 'Enter a valid 16-digit card number'
  if (card.name.trim().length < 2) errors.name = 'Enter the name on the card'
  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry)
  if (!match) errors.expiry = 'Use MM/YY'
  else {
    const month = Number(match[1])
    const year = 2000 + Number(match[2])
    const now = new Date()
    const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
    if (month < 1 || month > 12) errors.expiry = 'Month must be 01–12'
    else if (expired) errors.expiry = 'This card has expired'
  }
  if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = '3 or 4 digits'
  return errors
}

export const cardBrand = (number: string) => {
  const digits = number.replace(/\D/g, '')
  if (/^4/.test(digits)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
  if (/^(60|65|81|82|508)/.test(digits)) return 'RuPay'
  if (/^3[47]/.test(digits)) return 'Amex'
  return 'Card'
}

export const UPI_PATTERN = /^[a-z0-9._-]{2,}@[a-z]{2,}$/i
