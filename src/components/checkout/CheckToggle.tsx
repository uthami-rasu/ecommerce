import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

/** Styled checkbox with label. */
export function CheckToggle({ id, checked, onChange, children }: { id: string; checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }) {
  return (
    <label htmlFor={id} className="group inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={`grid size-5 place-items-center rounded-md border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#D9B27C]/30 ${
          checked ? 'border-[#173f32] bg-[#173f32] text-white dark:border-amber-300 dark:bg-amber-300 dark:text-stone-900' : 'border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-950'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3.5} />}
      </span>
      {children}
    </label>
  )
}
