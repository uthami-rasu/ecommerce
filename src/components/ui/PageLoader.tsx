/** Full-page placeholder while a lazy route or the session loads. */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite" data-page-loader>
      <div className="flex flex-col items-center gap-3 text-stone-500 dark:text-stone-400">
        <span className="size-9 animate-spin rounded-full border-2 border-amber-300 border-t-[#173f32] dark:border-stone-700 dark:border-t-amber-400" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">{label}…</span>
      </div>
    </div>
  )
}
