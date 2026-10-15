import { Smartphone } from 'lucide-react'
import { FormField } from './FormField'
import { inputBorder, inputClass } from './formStyles'

type UpiPaymentFormProps = { value: string; error?: string; onChange: (value: string) => void; disabled?: boolean }

/** Simulated UPI collect request. */
export function UpiPaymentForm({ value, error, onChange, disabled }: UpiPaymentFormProps) {
  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#173f32] to-[#0f2b22] p-5 text-white">
        <span className="grid size-12 flex-none place-items-center rounded-2xl bg-white/10"><Smartphone size={22} aria-hidden /></span>
        <p className="text-sm leading-relaxed text-white/80">
          Enter your UPI ID. We’ll send a collect request to your UPI app — approve it to complete the payment.
        </p>
      </div>
      <FormField id="upi-id" label="UPI ID" error={error} hint="e.g. yourname@okhdfcbank">
        <input
          id="upi-id"
          value={value}
          onChange={(event) => onChange(event.target.value.trim())}
          disabled={disabled}
          autoComplete="off"
          placeholder="yourname@bank"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? 'upi-id-error' : 'upi-id-hint'}
          className={`${inputClass} ${inputBorder(Boolean(error))}`}
        />
      </FormField>
      <p className="rounded-xl bg-amber-50/80 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        Test mode: any valid-looking UPI ID works and the request is approved instantly.
      </p>
    </div>
  )
}
