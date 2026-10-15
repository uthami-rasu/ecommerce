import type { ReactNode } from 'react'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import honeyJars from '../../assets/images/8773eeca3cba18ea1f474f415ed58dd51b2c77ee.webp'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { toggleTheme } from '../../features/theme/themeSlice'
import { Brand } from '../ui/Brand'
import type { AuthMode } from './authModes'
import { BrandPanel } from './BrandPanel'

const YEAR = new Date().getFullYear()

function ThemeSwitch({ onDark }: { onDark?: boolean }) {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.value)
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${next} theme`}
      className={`grid size-10 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/40 ${
        onDark
          ? 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
          : 'bg-white/70 text-stone-700 ring-1 ring-stone-200 hover:bg-white dark:bg-stone-900/70 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-800'
      }`}
    >
      {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}

function BackToStore({ onDark }: { onDark?: boolean }) {
  return (
    <a
      href="#home"
      className={`group inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/40 ${
        onDark
          ? 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
          : 'bg-white/70 text-stone-700 ring-1 ring-stone-200 hover:bg-white hover:text-[#173f32] dark:bg-stone-900/70 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-800'
      }`}
    >
      <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" size={15} aria-hidden="true" />
      <span className={onDark ? 'sr-only sm:not-sr-only' : ''}>Back to store</span>
    </a>
  )
}

/** Full-screen auth shell: brand panel (desktop) / compact brand header (mobile) + glass form card. */
export function AuthLayout({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  return (
    <div className="auth-root flex min-h-screen bg-[#fbf9f4] dark:bg-stone-950">
      <BrandPanel mode={mode} />

      <div className="auth-canvas relative flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="auth-aurora auth-grain auth-brand-light relative overflow-hidden px-4 pb-16 pt-2 text-white sm:px-6 lg:hidden">
          <img src={honeyJars} alt="" aria-hidden="true" className="auth-float pointer-events-none absolute -bottom-6 right-2 w-28 opacity-90 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] sm:right-8 sm:w-36" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <Brand />
            <div className="flex items-center gap-2">
              <BackToStore onDark />
              <ThemeSwitch onDark />
            </div>
          </div>
          <p className="relative z-10 mt-1 max-w-[62%] font-display text-[1.6rem] font-bold leading-[1.02] sm:text-3xl">
            Nature’s finest, <span className="italic text-[#e4c08d]">saved for you.</span>
          </p>
        </header>

        <div className="hidden items-center justify-end gap-3 px-10 pt-7 lg:flex">
          <BackToStore />
          <ThemeSwitch />
        </div>

        <main className="relative z-10 -mt-10 flex flex-1 items-start justify-center px-4 pb-8 sm:px-6 lg:mt-0 lg:items-center lg:py-8">
          <div className="w-full max-w-[468px] rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_30px_80px_-30px_rgba(23,63,50,0.35),0_2px_6px_rgba(0,0,0,0.04)] backdrop-blur-2xl sm:p-9 dark:border-white/10 dark:bg-stone-900/60 dark:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
            {children}
          </div>
        </main>

        <footer className="px-6 pb-6 text-center text-xs text-stone-500 dark:text-stone-500">
          © {YEAR} Bossco Naturals · Need help?{' '}
          <a className="font-semibold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200" href="#contact">
            Contact us
          </a>
        </footer>
      </div>
    </div>
  )
}
