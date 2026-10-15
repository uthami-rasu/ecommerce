import type { ReactNode } from 'react'
import { href } from '../../utils/router'

export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-7">
      <h1 className="font-display text-[2.35rem] font-bold leading-none tracking-tight text-[#173f32] sm:text-[2.7rem] dark:text-stone-50">{title}</h1>
      {children && <p className="mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{children}</p>}
    </div>
  )
}

/** Sign in / Create account segmented switch; keeps `?next=` when flipping. */
export function ModeSwitch({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const tabs = [
    { mode: 'login', label: 'Sign in' },
    { mode: 'register', label: 'Create account' },
  ] as const
  return (
    <nav aria-label="Account access" className="relative mb-8 grid grid-cols-2 rounded-full bg-stone-100/90 p-1 ring-1 ring-stone-200/80 dark:bg-stone-800/70 dark:ring-stone-700">
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-stone-950 ${
          mode === 'register' ? 'translate-x-full' : ''
        }`}
      />
      {tabs.map((tab) => (
        <a
          key={tab.mode}
          href={href(tab.mode, { next })}
          aria-current={tab.mode === mode ? 'page' : undefined}
          className={`relative z-10 rounded-full py-2.5 text-center text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B27C] ${
            tab.mode === mode ? 'text-[#173f32] dark:text-amber-100' : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  )
}
