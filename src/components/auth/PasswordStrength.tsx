import { Check, Circle } from 'lucide-react'
import { passwordChecks, passwordStrength } from './validation'

const LEVELS = [
  { label: 'Too weak', bar: 'bg-rose-400' },
  { label: 'Weak', bar: 'bg-rose-400' },
  { label: 'Fair', bar: 'bg-amber-400' },
  { label: 'Good', bar: 'bg-emerald-500' },
  { label: 'Strong', bar: 'bg-emerald-600' },
]

/** Live strength meter + the API's password rules. */
export function PasswordStrength({ password, id }: { password: string; id?: string }) {
  const score = passwordStrength(password)
  const level = LEVELS[score]
  return (
    <div id={id} className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`h-1.5 rounded-full transition-colors duration-300 ${step <= score ? level.bar : 'bg-stone-200 dark:bg-stone-700'}`}
            />
          ))}
        </div>
        <span className="w-16 text-right text-[11px] font-semibold text-stone-500 dark:text-stone-400">
          {password ? level.label : ''}
        </span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {passwordChecks(password).map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              check.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {check.ok ? <Check size={13} strokeWidth={3} /> : <Circle size={11} />}
            {check.label}
            <span className="sr-only">{check.ok ? '(met)' : '(not met)'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
