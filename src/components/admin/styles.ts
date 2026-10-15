/** Shared class strings for the admin panel (kept here so components stay consistent). */

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900'

const buttonBase = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${focus}`

export const btn = {
  primary: `${buttonBase} text-sm bg-[#173f32] px-4 py-2.5 text-white shadow-sm hover:bg-[#1e5040] dark:bg-emerald-600 dark:hover:bg-emerald-500`,
  secondary: `${buttonBase} text-sm bg-white px-4 py-2.5 text-stone-800 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700 dark:hover:bg-stone-700`,
  danger: `${buttonBase} text-sm bg-rose-600 px-4 py-2.5 text-white hover:bg-rose-700`,
  dangerGhost: `${buttonBase} text-sm px-3 py-2 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40`,
  ghost: `${buttonBase} text-sm px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white`,
  small: `${buttonBase} bg-white px-3 py-1.5 text-xs text-stone-800 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700 dark:hover:bg-stone-700`,
  smallPrimary: `${buttonBase} bg-[#173f32] px-3 py-1.5 text-xs text-white hover:bg-[#1e5040] dark:bg-emerald-600 dark:hover:bg-emerald-500`,
  icon: `inline-grid size-9 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white ${focus}`,
}

export const input =
  'w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-[#173f32]/60 disabled:opacity-60 aria-[invalid=true]:ring-rose-400 dark:bg-stone-950 dark:text-stone-100 dark:ring-stone-700 dark:placeholder:text-stone-500 dark:focus:ring-emerald-500/70'

export const label = 'mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300'

export const card =
  'rounded-2xl bg-white ring-1 ring-stone-200/80 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-12px_rgba(28,25,23,0.08)] dark:bg-stone-900 dark:ring-stone-800'

export const focusRing = focus
