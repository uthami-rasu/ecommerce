/** Date helpers for the admin panel (local time). */

const DAY = 86_400_000

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** `yyyy-mm-dd` in local time, for `<input type="date">`. */
export const toDateInput = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Parses a `yyyy-mm-dd` input value as a local date (null when empty / invalid). */
export const fromDateInput = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** End of the given local day, as an ISO string (what the API stores as an ETA). */
export const endOfDayIso = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString()

/** Start / end of a `yyyy-mm-dd` local day as ISO (list date filters). */
export const dayBoundIso = (value: string, bound: 'start' | 'end') => {
  const date = fromDateInput(value)
  if (!date) return undefined
  return bound === 'start' ? date.toISOString() : endOfDayIso(date)
}

/** Local date `days` from today. */
export const daysFromToday = (days: number) => {
  const today = startOfDay(new Date())
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + days)
}

export const todayInput = () => toDateInput(new Date())

/** Whole calendar days from today to the given date (negative = past). */
export const calendarDaysFromToday = (iso: string) =>
  Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / DAY)

/** "Today", "Tomorrow", "In 3 days", "2 days late" — for ETAs. */
export const etaPhrase = (iso: string) => {
  const days = calendarDaysFromToday(iso)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days > 1) return `In ${days} days`
  return days === -1 ? '1 day late' : `${-days} days late`
}

export const shortDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export const weekdayDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

export const timeOfDay = (iso: string | Date) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
