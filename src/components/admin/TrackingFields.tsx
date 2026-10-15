import { CalendarDays } from 'lucide-react'
import { useId } from 'react'
import { daysFromToday, fromDateInput, toDateInput, todayInput, weekdayDate } from './dates'
import { input, label } from './styles'
import { CARRIERS, trackingErrors, type TrackingDraft } from './tracking'

const QUICK_PICKS = [
  { label: 'Tomorrow', days: 1 },
  { label: 'In 2 days', days: 2 },
  { label: 'In 3 days', days: 3 },
  { label: 'In 5 days', days: 5 },
]

export function TrackingFields({ value, onChange, etaHint, disabled }: {
  value: TrackingDraft
  onChange: (value: TrackingDraft) => void
  /** Shown under the ETA when no date is picked (e.g. what the server defaults to). */
  etaHint?: string
  disabled?: boolean
}) {
  const id = useId()
  const errors = trackingErrors(value)
  const set = (patch: Partial<TrackingDraft>) => onChange({ ...value, ...patch })
  const etaDate = value.eta ? fromDateInput(value.eta) : null

  return (
    <div className="@container">
    <fieldset className="grid min-w-0 gap-4" disabled={disabled}>
      <legend className="sr-only">Shipment details</legend>
      <div className="grid gap-4 @[26rem]:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${id}-carrier`}>Courier</label>
          <input
            id={`${id}-carrier`}
            className={input}
            list={`${id}-carriers`}
            value={value.carrier}
            onChange={(event) => set({ carrier: event.target.value })}
            placeholder="e.g. Delhivery"
            autoComplete="off"
            maxLength={80}
          />
          <datalist id={`${id}-carriers`}>
            {CARRIERS.map((carrier) => <option key={carrier} value={carrier} />)}
          </datalist>
        </div>
        <div>
          <label className={label} htmlFor={`${id}-number`}>Tracking number</label>
          <input
            id={`${id}-number`}
            className={`${input} font-mono`}
            value={value.trackingNumber}
            onChange={(event) => set({ trackingNumber: event.target.value })}
            placeholder="AWB / consignment no."
            autoComplete="off"
            spellCheck={false}
            maxLength={80}
          />
        </div>
      </div>
      <div>
        <label className={label} htmlFor={`${id}-url`}>Tracking link <span className="font-normal text-stone-400">(optional)</span></label>
        <input
          id={`${id}-url`}
          className={input}
          type="url"
          inputMode="url"
          value={value.trackingUrl}
          onChange={(event) => set({ trackingUrl: event.target.value })}
          placeholder="https://www.delhivery.com/track/package/…"
          aria-invalid={Boolean(errors.trackingUrl)}
          aria-describedby={errors.trackingUrl ? `${id}-url-error` : undefined}
          maxLength={500}
        />
        {errors.trackingUrl && <p id={`${id}-url-error`} className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors.trackingUrl}</p>}
      </div>
      <div>
        <span className={label} id={`${id}-eta-label`}>Expected delivery</span>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-eta-label`}>
          {QUICK_PICKS.map((pick) => {
            const pickValue = toDateInput(daysFromToday(pick.days))
            const selected = value.eta === pickValue
            return (
              <button
                key={pick.days}
                type="button"
                aria-pressed={selected}
                onClick={() => set({ eta: selected ? '' : pickValue })}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  selected
                    ? 'bg-[#173f32] text-white ring-[#173f32] dark:bg-emerald-600 dark:ring-emerald-600'
                    : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-50 dark:bg-stone-950 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-800'
                }`}
              >
                {pick.label}
              </button>
            )
          })}
          <label className="relative inline-flex items-center">
            <span className="sr-only">Custom expected delivery date</span>
            <CalendarDays size={14} aria-hidden className="pointer-events-none absolute left-3 text-stone-400" />
            <input
              type="date"
              className={`${input} !w-auto !rounded-full !py-1.5 !pl-8 !text-xs`}
              min={todayInput()}
              value={value.eta}
              onChange={(event) => set({ eta: event.target.value })}
              aria-invalid={Boolean(errors.eta)}
              aria-describedby={`${id}-eta-help`}
            />
          </label>
        </div>
        <p id={`${id}-eta-help`} className={`mt-1.5 text-xs ${errors.eta ? 'text-rose-600 dark:text-rose-300' : 'text-stone-500 dark:text-stone-400'}`}>
          {errors.eta ?? (etaDate ? `Arrives by ${weekdayDate(etaDate)} — the customer sees this on their order.` : etaHint ?? 'No date set.')}
        </p>
      </div>
    </fieldset>
    </div>
  )
}
