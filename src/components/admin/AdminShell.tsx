import { LayoutDashboard, LogOut, Menu, Moon, ShoppingBag, Store, Sun, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useGetDashboardQuery } from '../../features/admin/adminApi'
import { signOut } from '../../features/auth/authSlice'
import { toggleTheme } from '../../features/theme/themeSlice'
import { useAuth } from '../../hooks/useAuth'
import { fullName, initials } from '../../utils/format'
import { navigate } from '../../utils/router'
import { Dialog } from './Dialog'
import { btn } from './styles'

export type AdminSection = 'dashboard' | 'orders'

type NavItem = { id: AdminSection; label: string; href: string; icon: LucideIcon; badge?: number }

function BrandMark({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <a href="#admin" className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
      <span className="grid size-9 place-items-center rounded-xl bg-[#D9B27C] font-display text-xl font-bold text-[#173f32] shadow-inner">B</span>
      <span className="flex flex-col leading-none">
        <span className={`text-[15px] font-bold tracking-[.2em] ${tone === 'light' ? 'text-white' : 'text-[#173f32] dark:text-stone-50'}`}>BOSSCO</span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[.26em] text-[#D9B27C]">Store admin</span>
      </span>
    </a>
  )
}

function ThemeButton({ className }: { className: string }) {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.value)
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button type="button" className={className} onClick={() => dispatch(toggleTheme())} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {theme === 'light' ? <Moon size={17} aria-hidden /> : <Sun size={17} aria-hidden />}
    </button>
  )
}

function NavLinks({ items, active, onNavigate }: { items: NavItem[]; active: AdminSection; onNavigate?: () => void }) {
  return (
    <ul className="grid gap-1">
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <li key={item.id}>
            <a
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isActive ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-emerald-50/75 hover:bg-white/6 hover:text-white'
              }`}
            >
              <item.icon size={18} aria-hidden className={isActive ? 'text-[#D9B27C]' : 'text-emerald-100/60 group-hover:text-emerald-50'} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="min-w-6 rounded-full bg-[#D9B27C] px-1.5 py-0.5 text-center text-[11px] font-bold text-[#173f32]" aria-label={`${item.badge} awaiting action`}>
                  {item.badge}
                </span>
              ) : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function SidebarBody({ items, active, onNavigate }: { items: NavItem[]; active: AdminSection; onNavigate?: () => void }) {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await dispatch(signOut())
    toast.success('Signed out')
    navigate('home')
  }

  return (
    <div className="flex h-full flex-col bg-[#173f32] px-4 py-5 text-white dark:bg-[#0f2a21]">
      <div className="px-1"><BrandMark /></div>
      <nav aria-label="Admin" className="mt-8 flex-1">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-100/45">Manage</p>
        <NavLinks items={items} active={active} onNavigate={onNavigate} />
        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-100/45">Storefront</p>
        <a
          href="#home"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-50/75 transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Store size={18} aria-hidden className="text-emerald-100/60" /> View store
        </a>
      </nav>
      {user && (
        <div className="mt-4 rounded-2xl bg-white/6 p-3 ring-1 ring-white/8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#D9B27C]/90 text-xs font-bold text-[#173f32]">{initials(user) || 'A'}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{fullName(user) || 'Admin'}</p>
              <p className="truncate text-xs text-emerald-100/60">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold text-emerald-50 transition-colors hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-60"
            >
              <LogOut size={14} aria-hidden /> {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
            <ThemeButton className="grid size-8 place-items-center rounded-xl bg-white/8 text-emerald-50 transition-colors hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" />
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminShell({ active, children }: { active: AdminSection; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  // Polls so new orders show up without a reload (paused while the tab is hidden).
  const { data } = useGetDashboardQuery(undefined, { pollingInterval: 30_000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: 15 })
  const awaiting = data?.ordersByStatus.paid ?? 0

  const items: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '#admin', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', href: '#admin/orders', icon: ShoppingBag, badge: awaiting },
  ]

  return (
    <div className="admin-root min-h-screen bg-[#f7f4ee] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] lg:block">
        <SidebarBody items={items} active={active} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-stone-200/70 bg-[#f7f4ee]/85 px-4 py-2.5 backdrop-blur-md lg:hidden dark:border-stone-800 dark:bg-stone-950/85">
        <div className="flex items-center gap-2">
          <button type="button" className={btn.icon} onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu size={20} aria-hidden />
            {awaiting > 0 && <span className="absolute ml-5 -mt-5 size-2 rounded-full bg-amber-500" aria-hidden />}
          </button>
          <BrandMark tone="dark" />
        </div>
        <ThemeButton className={btn.icon} />
      </header>

      {menuOpen && (
        <Dialog title="Admin menu" variant="drawer" onClose={() => setMenuOpen(false)}>
          <SidebarBody items={items} active={active} onNavigate={() => setMenuOpen(false)} />
        </Dialog>
      )}

      <div className="lg:pl-[260px]">
        <main id="admin-main" className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
