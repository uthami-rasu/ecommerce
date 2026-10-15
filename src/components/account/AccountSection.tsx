import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'

export const cardClass =
  'rounded-3xl border border-[#ece6db] bg-white/85 shadow-[0_20px_50px_-30px_rgba(23,63,50,0.25)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/70'

/** Content card used by every account tab. */
export function AccountSection({ title, description, actions, children, className = '' }: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`${cardClass} p-5 sm:p-8 ${className}`}>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-[1.9rem] font-bold leading-none text-[#173f32] dark:text-stone-50">{title}</h2>
          {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500 dark:text-stone-400">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

export function SecondaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-[13px] font-semibold text-stone-700 transition hover:border-[#173f32]/40 hover:text-[#173f32] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-amber-200/40 dark:hover:text-amber-100 ${className}`}
      {...props}
    />
  )
}

export function EmptyState({ icon: Icon, title, children, action }: { icon: ComponentType<{ size?: number }>; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#e2d8c6] bg-[#fbf8f2]/70 px-6 py-12 text-center dark:border-stone-700 dark:bg-stone-900/40">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#173f32]/8 text-[#173f32] ring-1 ring-[#173f32]/10 dark:bg-amber-200/10 dark:text-amber-200 dark:ring-amber-200/10">
        <Icon size={24} />
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold text-[#173f32] dark:text-stone-100">{title}</h3>
      {children && <p className="mt-1.5 max-w-sm text-sm text-stone-500 dark:text-stone-400">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
