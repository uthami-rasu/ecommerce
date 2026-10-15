/** Shared input styling for checkout & payment forms. */
export const inputClass =
  'h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#D9B27C] focus:ring-4 focus:ring-[#D9B27C]/20 dark:bg-stone-950 dark:text-stone-100'

export const inputBorder = (invalid: boolean) =>
  invalid ? 'border-rose-300 dark:border-rose-800' : 'border-stone-200 dark:border-stone-700'
