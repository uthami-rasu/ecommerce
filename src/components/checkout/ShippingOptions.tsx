import { Check, Store, Truck, Zap } from 'lucide-react'
import type { Cart, ShippingMethod } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { SHIPPING_METHOD_HINT } from './checkoutConstants'

const ICON = { standard: Truck, express: Zap, pickup: Store } as const

type ShippingOptionsProps = {
  options: Cart['shippingOptions']
  value: ShippingMethod
  onChange: (method: ShippingMethod) => void
  disabled?: boolean
  name?: string
}

/** Radio cards for the shipping methods the API offers (fees from the server). */
export function ShippingOptions({ options, value, onChange, disabled, name = 'shipping-method' }: ShippingOptionsProps) {
  return (
    <fieldset className="grid gap-2.5" disabled={disabled}>
      <legend className="sr-only">Shipping method</legend>
      {options.map((option) => {
        const Icon = ICON[option.method]
        const selected = option.method === value
        return (
          <label
            key={option.method}
            className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#D9B27C]/30 ${
              selected
                ? 'border-[#173f32] bg-[#173f32]/[0.04] shadow-sm dark:border-amber-300/70 dark:bg-amber-300/5'
                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:hover:border-stone-600'
            }`}
          >
            <input type="radio" name={name} value={option.method} checked={selected} onChange={() => onChange(option.method)} className="sr-only" />
            <span
              aria-hidden
              className={`grid size-5 flex-none place-items-center rounded-full border-2 transition ${
                selected ? 'border-[#173f32] bg-[#173f32] text-white dark:border-amber-300 dark:bg-amber-300 dark:text-stone-900' : 'border-stone-300 dark:border-stone-600'
              }`}
            >
              {selected && <Check size={11} strokeWidth={3.5} />}
            </span>
            <Icon size={17} className="flex-none text-stone-400 group-hover:text-stone-500" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-stone-800 dark:text-stone-100">{option.label}</span>
              <span className="block text-xs text-stone-500 dark:text-stone-400">{SHIPPING_METHOD_HINT[option.method]}</span>
            </span>
            <span className={`text-sm font-bold tabular-nums ${option.fee === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-100'}`}>
              {option.fee === 0 ? 'Free' : formatMoney(option.fee)}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
