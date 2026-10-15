import { CreditCard } from 'lucide-react'
import { cardBrand, formatCardNumber, formatExpiry, type CardDraft, type CardErrors } from './cardUtils'
import { FormField } from './FormField'
import { inputBorder, inputClass } from './formStyles'

type CardPaymentFormProps = {
  value: CardDraft
  errors: CardErrors
  onChange: (value: CardDraft) => void
  disabled?: boolean
}

/** Simulated card entry with a live card preview. */
export function CardPaymentForm({ value, errors, onChange, disabled }: CardPaymentFormProps) {
  const set = (key: keyof CardDraft, next: string) => onChange({ ...value, [key]: next })
  const describedBy = (key: keyof CardDraft) => (errors[key] ? `card-${key}-error` : undefined)
  const masked = (value.number || '•••• •••• •••• ••••').padEnd(19, '•')

  return (
    <div className="grid gap-5">
      <div className="gateway-card-face relative mx-auto aspect-[1.586] w-full max-w-[340px] overflow-hidden rounded-2xl p-5 text-white shadow-[0_25px_50px_-20px_rgba(15,43,34,0.7)]" aria-hidden>
        <div className="flex items-start justify-between">
          <span className="gateway-chip block h-8 w-11 rounded-md" />
          <span className="text-sm font-extrabold italic tracking-wide">{cardBrand(value.number)}</span>
        </div>
        <p className="mt-7 font-mono text-[19px] tracking-[0.12em] sm:text-xl">{masked}</p>
        <div className="mt-5 flex items-end justify-between text-[10px] uppercase tracking-[0.18em] text-white/60">
          <span className="min-w-0">
            Card holder
            <b className="mt-1 block truncate text-xs font-semibold tracking-[0.1em] text-white">{value.name || 'Your name'}</b>
          </span>
          <span className="text-right">
            Expires
            <b className="mt-1 block text-xs font-semibold tracking-[0.1em] text-white">{value.expiry || 'MM/YY'}</b>
          </span>
        </div>
      </div>

      <fieldset className="grid grid-cols-2 gap-4" disabled={disabled}>
        <legend className="sr-only">Card details</legend>
        <FormField id="card-number" label="Card number" error={errors.number} className="col-span-2">
          <div className="relative">
            <input
              id="card-number"
              value={value.number}
              onChange={(event) => set('number', formatCardNumber(event.target.value))}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              aria-invalid={Boolean(errors.number) || undefined}
              aria-describedby={describedBy('number')}
              className={`${inputClass} ${inputBorder(Boolean(errors.number))} pr-11 font-mono tracking-wider`}
            />
            <CreditCard size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
          </div>
        </FormField>
        <FormField id="card-name" label="Name on card" error={errors.name} className="col-span-2">
          <input
            id="card-name"
            value={value.name}
            onChange={(event) => set('name', event.target.value)}
            autoComplete="cc-name"
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={describedBy('name')}
            className={`${inputClass} ${inputBorder(Boolean(errors.name))}`}
          />
        </FormField>
        <FormField id="card-expiry" label="Expiry" error={errors.expiry}>
          <input
            id="card-expiry"
            value={value.expiry}
            onChange={(event) => set('expiry', formatExpiry(event.target.value))}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            aria-invalid={Boolean(errors.expiry) || undefined}
            aria-describedby={describedBy('expiry')}
            className={`${inputClass} ${inputBorder(Boolean(errors.expiry))} font-mono`}
          />
        </FormField>
        <FormField id="card-cvv" label="CVV" error={errors.cvv}>
          <input
            id="card-cvv"
            value={value.cvv}
            onChange={(event) => set('cvv', event.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            autoComplete="cc-csc"
            type="password"
            placeholder="•••"
            aria-invalid={Boolean(errors.cvv) || undefined}
            aria-describedby={describedBy('cvv')}
            className={`${inputClass} ${inputBorder(Boolean(errors.cvv))} font-mono`}
          />
        </FormField>
      </fieldset>
      <p className="rounded-xl bg-amber-50/80 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        Test mode: use <b className="font-mono">4111 1111 1111 1111</b>, any future expiry and any CVV. No money is charged.
      </p>
    </div>
  )
}
