const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inrPrecise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** ₹1,299 — whole rupees unless the amount has paise. */
export const formatMoney = (rupees: number) => (Number.isInteger(rupees) ? inr : inrPrecise).format(rupees)

export const formatDate = (iso: string | Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-IN', options)

export const formatDateTime = (iso: string | Date) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3_600], ['minute', 60],
]

/** "3 days ago", "in 2 days", "just now". */
export const formatRelative = (iso: string | Date) => {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

export const fullName = (person: { firstName: string; lastName: string } | null | undefined) =>
  person ? `${person.firstName} ${person.lastName}`.trim() : ''

export const initials = (person: { firstName: string; lastName: string } | null | undefined) =>
  person ? `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase() : ''

export const formatAddress = (address: { line1: string; line2?: string | null; city: string; state: string; postalCode: string; country?: string }) =>
  [address.line1, address.line2, address.city, `${address.state} ${address.postalCode}`, address.country === 'IN' ? 'India' : address.country]
    .filter(Boolean)
    .join(', ')
