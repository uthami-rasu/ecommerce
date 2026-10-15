import { Minus, Plus } from 'lucide-react'

type QuantityStepperProps = {
  value: number
  max: number
  onChange: (quantity: number) => void
  disabled?: boolean
  label: string
  size?: 'sm' | 'md'
}

/** − 2 + control bounded by 1…max. */
export function QuantityStepper({ value, max, onChange, disabled, label, size = 'md' }: QuantityStepperProps) {
  const button = size === 'sm' ? 'size-7' : 'size-9'
  const base = `grid ${button} place-items-center rounded-full text-stone-600 transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#173f32] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent dark:text-stone-300 dark:hover:bg-stone-800`
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className="inline-flex items-center gap-0.5 rounded-full border border-stone-200 bg-white p-0.5 dark:border-stone-700 dark:bg-stone-900"
    >
      <button type="button" className={base} onClick={() => onChange(value - 1)} disabled={disabled || value <= 1} aria-label="Decrease quantity">
        <Minus size={13} strokeWidth={2.4} />
      </button>
      <output className="min-w-7 text-center text-sm font-bold tabular-nums" aria-live="polite">{value}</output>
      <button type="button" className={base} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Plus size={13} strokeWidth={2.4} />
      </button>
    </div>
  )
}
