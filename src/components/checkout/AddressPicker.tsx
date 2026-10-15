import { Check, Plus } from 'lucide-react'
import type { Address } from '../../types/api'
import { formatAddress, fullName } from '../../utils/format'

export const NEW_ADDRESS = 'new'

type AddressPickerProps = {
  name: string
  addresses: Address[]
  value: string
  onChange: (id: string) => void
  newLabel?: string
}

/** Saved addresses as radio cards plus an "Add a new address" option. */
export function AddressPicker({ name, addresses, value, onChange, newLabel = 'Add a new address' }: AddressPickerProps) {
  const card = (selected: boolean) =>
    `relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#D9B27C]/30 ${
      selected
        ? 'border-[#173f32] bg-[#173f32]/[0.04] shadow-sm dark:border-amber-300/70 dark:bg-amber-300/5'
        : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:hover:border-stone-600'
    }`
  const dot = (selected: boolean) =>
    `mt-0.5 grid size-5 flex-none place-items-center rounded-full border-2 transition ${
      selected ? 'border-[#173f32] bg-[#173f32] text-white dark:border-amber-300 dark:bg-amber-300 dark:text-stone-900' : 'border-stone-300 dark:border-stone-600'
    }`

  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Choose an address</legend>
      {addresses.map((address) => {
        const selected = value === address.id
        return (
          <label key={address.id} className={card(selected)}>
            <input type="radio" name={name} value={address.id} checked={selected} onChange={() => onChange(address.id)} className="sr-only" />
            <span aria-hidden className={dot(selected)}>{selected && <Check size={11} strokeWidth={3.5} />}</span>
            <span className="min-w-0 text-sm">
              <span className="flex flex-wrap items-center gap-1.5">
                <b className="font-bold text-stone-800 dark:text-stone-100">{fullName(address)}</b>
                {address.label && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:bg-stone-800 dark:text-stone-400">{address.label}</span>}
                {address.isDefaultShipping && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">Default</span>}
              </span>
              <span className="mt-1 block leading-relaxed text-stone-500 dark:text-stone-400">{formatAddress(address)}</span>
              <span className="mt-1 block text-xs text-stone-400">{address.phone}</span>
            </span>
          </label>
        )
      })}
      <label className={`${card(value === NEW_ADDRESS)} items-center`}>
        <input type="radio" name={name} value={NEW_ADDRESS} checked={value === NEW_ADDRESS} onChange={() => onChange(NEW_ADDRESS)} className="sr-only" />
        <span aria-hidden className={`${dot(value === NEW_ADDRESS)} mt-0`}>{value === NEW_ADDRESS && <Check size={11} strokeWidth={3.5} />}</span>
        <span className="flex items-center gap-2 text-sm font-bold text-[#173f32] dark:text-amber-200">
          <Plus size={16} aria-hidden /> {newLabel}
        </span>
      </label>
    </fieldset>
  )
}
