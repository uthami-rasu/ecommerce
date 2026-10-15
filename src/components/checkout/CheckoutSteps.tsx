import { Check } from 'lucide-react'

const STEPS = ['Shopping cart', 'Checkout details', 'Order complete'] as const

/** "1 Shopping cart — 2 Checkout details — 3 Order complete" progress header. */
export function CheckoutSteps({ active }: { active: 1 | 2 | 3 }) {
  return (
    <ol className="mx-auto mb-10 mt-6 grid max-w-3xl grid-cols-3 gap-3 sm:mb-14 sm:gap-6" aria-label="Checkout progress">
      {STEPS.map((label, index) => {
        const step = index + 1
        const done = active > step
        const current = active === step
        return (
          <li
            key={label}
            aria-current={current ? 'step' : undefined}
            className={`flex items-center gap-2.5 border-b-2 pb-3 pt-2 transition-colors sm:gap-3 ${
              done
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : current
                  ? 'border-[#173f32] text-[#173f32] dark:border-amber-300 dark:text-amber-200'
                  : 'border-stone-200 text-stone-400 dark:border-stone-800 dark:text-stone-500'
            }`}
          >
            <span
              className={`grid size-7 flex-none place-items-center rounded-full text-[11px] font-extrabold text-white sm:size-8 ${
                done ? 'bg-emerald-500' : current ? 'bg-[#173f32] dark:bg-amber-300 dark:text-stone-900' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} aria-hidden /> : step}
            </span>
            <span className={`text-xs font-bold sm:text-sm ${current ? '' : 'max-sm:sr-only'}`}>
              {label}
              {done && <span className="sr-only"> (completed)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
