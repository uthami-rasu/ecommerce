import { Minus, Plus } from 'lucide-react'

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export function QuantityStepper({ value, onChange, min = 1, max = 20, disabled = false }: QuantityStepperProps) {
  return (
    <div className="quantity-control" role="group" aria-label="Quantity">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={disabled || value <= min} aria-label="Decrease quantity"><Minus size={14} /></button>
      <span aria-live="polite" aria-atomic="true"><span className="sr-only">Quantity </span>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={disabled || value >= max} aria-label="Increase quantity"><Plus size={14} /></button>
    </div>
  )
}
