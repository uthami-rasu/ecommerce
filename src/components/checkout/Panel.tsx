import type { ReactNode } from 'react'

type PanelProps = {
  title?: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
  as?: 'section' | 'aside' | 'div'
  'aria-labelledby'?: string
}

/** Rounded glass card used across cart, checkout and order pages. */
export function Panel({ title, subtitle, icon, action, className = '', children, as: Tag = 'section' }: PanelProps) {
  return (
    <Tag
      className={`rounded-3xl border border-stone-200/80 bg-white/85 p-5 shadow-[0_18px_45px_-28px_rgba(23,63,50,0.35)] backdrop-blur-xl sm:p-6 dark:border-stone-800 dark:bg-stone-900/80 dark:shadow-none ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="grid size-9 flex-none place-items-center rounded-xl bg-[#173f32]/8 text-[#173f32] dark:bg-amber-300/10 dark:text-amber-200">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-[17px] font-bold text-[#173f32] dark:text-stone-50">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-[13px] text-stone-500 dark:text-stone-400">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </Tag>
  )
}
