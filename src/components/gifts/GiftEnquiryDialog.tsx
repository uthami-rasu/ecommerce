import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2, X } from 'lucide-react'
import { useCreateGiftEnquiryMutation } from '../../features/gifting/giftingApi'
import { useAuth } from '../../hooks/useAuth'
import { errorMessage } from '../../lib/http/apiClient'
import type { GiftEnquiryKind, GiftOccasion } from '../../types/api'

type GiftEnquiryDialogProps = {
  kind: GiftEnquiryKind | null
  occasions: GiftOccasion[]
  /** Pre-selected occasion name (the active filter), if any. */
  occasion?: string
  onClose: () => void
}

const COPY: Record<GiftEnquiryKind, { title: string; intro: string; placeholder: string }> = {
  bulk: {
    title: 'Request a bulk order quote',
    intro: 'Tell us about your event and we’ll send volume pricing within one working day.',
    placeholder: 'Which gifts are you interested in? Any packaging or delivery requirements?',
  },
  customize: {
    title: 'Customize your gift',
    intro: 'Name tags, messages or your logo on every box — share the details and we’ll send a mock-up.',
    placeholder: 'What would you like printed (names, message, logo)? Any colours or themes?',
  },
}

const field =
  'w-full rounded-xl border-0 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173f32]/50 dark:bg-stone-950 dark:text-stone-100 dark:ring-stone-700'
const labelClass = 'mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300'

/** Bulk-quote / customisation request. Stored for the admin under Return Gifts → Enquiries. */
export function GiftEnquiryDialog({ kind, occasions, occasion, onClose }: GiftEnquiryDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { user } = useAuth()
  const [create, { isLoading }] = useCreateGiftEnquiryMutation()
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (kind && !element.open) {
      setError(null)
      setReference(null)
      element.showModal()
      window.lenis?.stop()
    }
    if (!kind && element.open) element.close()
    return () => window.lenis?.start()
  }, [kind])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!kind) return
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '').trim()
    const quantity = Number(text('quantity'))
    setError(null)
    try {
      const result = await create({
        kind,
        fullName: text('fullName'),
        email: text('email'),
        phone: text('phone'),
        occasion: text('occasion') || undefined,
        quantity: quantity > 0 ? Math.round(quantity) : undefined,
        eventDate: text('eventDate') || undefined,
        message: text('message'),
      }).unwrap()
      setReference(result.reference.slice(0, 8).toUpperCase())
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const copy = kind ? COPY[kind] : COPY.bulk
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={(event) => {
        if (isLoading) event.preventDefault()
      }}
      onClick={(event) => {
        if (event.target === dialog.current && !isLoading) onClose()
      }}
      aria-labelledby="gift-enquiry-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(560px,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-0 text-stone-800 shadow-2xl backdrop:bg-stone-950/50 backdrop:backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
      data-lenis-prevent
    >
      <div className="relative p-6 sm:p-8">
        <button type="button" onClick={onClose} disabled={isLoading} aria-label="Close" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
          <X size={18} />
        </button>

        {reference ? (
          <div className="py-6 text-center" role="status">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500" aria-hidden />
            <h2 id="gift-enquiry-title" className="mt-4 font-display text-3xl font-bold text-[#173f32] dark:text-stone-50">Thank you!</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
              We’ve received your request (ref. <b className="font-mono text-stone-700 dark:text-stone-200">{reference}</b>). Our gifting team will contact you shortly.
            </p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-[#173f32] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1e5040]">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <div className="pr-8">
              <h2 id="gift-enquiry-title" className="font-display text-3xl font-bold leading-tight text-[#173f32] dark:text-stone-50">{copy.title}</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{copy.intro}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={labelClass}>Full name *</span>
                <input name="fullName" required minLength={2} maxLength={120} defaultValue={fullName} autoComplete="name" className={field} />
              </label>
              <label>
                <span className={labelClass}>Email *</span>
                <input name="email" type="email" required maxLength={254} defaultValue={user?.email ?? ''} autoComplete="email" className={field} />
              </label>
              <label>
                <span className={labelClass}>Phone *</span>
                <input name="phone" type="tel" required pattern="\+?[0-9 ()\-]{7,20}" title="A phone number, e.g. +91 98123 45670" defaultValue={user?.phone ?? ''} autoComplete="tel" className={field} />
              </label>
              <label>
                <span className={labelClass}>Occasion</span>
                <select name="occasion" defaultValue={occasion ?? ''} className={field}>
                  <option value="">Not decided yet</option>
                  {occasions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span className={labelClass}>Number of gifts</span>
                <input name="quantity" type="number" min={1} max={1000000} inputMode="numeric" placeholder="e.g. 150" className={field} />
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Event date</span>
                <input name="eventDate" type="date" min={new Date().toISOString().slice(0, 10)} className={field} />
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Details *</span>
                <textarea name="message" required minLength={10} maxLength={3000} rows={4} placeholder={copy.placeholder} className={field} />
              </label>
            </div>
            {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
            <button type="submit" disabled={isLoading} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#173f32] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#1e5040] disabled:opacity-60">
              {isLoading && <Loader2 size={16} className="animate-spin" />} Send request
            </button>
          </form>
        )}
      </div>
    </dialog>
  )
}
