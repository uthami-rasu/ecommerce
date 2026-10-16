import {
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { useGetDashboardQuery } from '../../features/admin/adminApi'
import { signOut } from '../../features/auth/authSlice'
import { navigate } from '../../utils/router'
import { Dialog } from './Dialog'
import { btn } from './styles'

export type AdminSection = 'dashboard' | 'orders' | 'products' | 'categories' | 'customers' | 'settings'

type NavItem = { id: AdminSection; label: string; href: string; icon: LucideIcon; badge?: number }

function BrandMark({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <a href="#admin" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
      <span className="grid size-9 place-items-center rounded-xl bg-[#22c55e] text-white shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`text-[17px] font-bold tracking-tight ${tone === 'light' ? 'text-white' : 'text-[#1c3321]'}`}>
          NutriStock
        </span>
      </span>
    </a>
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
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isActive
                  ? 'bg-[#3b5a3b] text-white shadow-sm font-semibold'
                  : 'text-stone-200/80 hover:bg-white/8 hover:text-white'
              }`}
            >
              <item.icon
                size={18}
                aria-hidden
                className={isActive ? 'text-white' : 'text-stone-300/70 group-hover:text-white'}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="min-w-6 rounded-full bg-emerald-500 px-1.5 py-0.5 text-center text-[11px] font-bold text-white" aria-label={`${item.badge} awaiting action`}>
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
  const dispatch = useAppDispatch()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await dispatch(signOut())
    toast.success('Signed out')
    navigate('home')
  }

  return (
    <div className="flex h-full flex-col bg-[#24412a] px-4 py-5 text-white dark:bg-[#182b1d]">
      <div className="px-1"><BrandMark /></div>
      <nav aria-label="Admin" className="mt-8 flex-1">
        <NavLinks items={items} active={active} onNavigate={onNavigate} />
        <div className="mt-6 border-t border-white/10 pt-4">
          <a
            href="#home"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-stone-200/70 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Store size={18} aria-hidden className="text-stone-300/70" /> View Storefront
          </a>
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-2.5 ring-1 ring-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Robert Fox"
              className="size-9 shrink-0 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white leading-tight">
                Robert Fox
              </p>
              <p className="truncate text-xs text-stone-300/70 leading-tight">Store Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              className="grid size-7 place-items-center rounded-lg text-stone-300 hover:bg-white/10 hover:text-rose-300 transition-colors"
            >
              <LogOut size={14} aria-hidden />
            </button>
          </div>
        </div>
      </div>
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
    { id: 'products', label: 'Products', href: '#admin/products', icon: Package },
    { id: 'categories', label: 'Categories', href: '#admin/categories', icon: Layers },
    { id: 'orders', label: 'Orders', href: '#admin/orders', icon: ShoppingBag, badge: awaiting },
    { id: 'customers', label: 'Customers', href: '#admin/customers', icon: Users },
    { id: 'settings', label: 'Settings', href: '#admin/settings', icon: Settings },
  ]

  return (
    <div className="admin-root min-h-screen bg-[#f8faf8] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] lg:block">
        <SidebarBody items={items} active={active} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-stone-200/70 bg-[#f8faf8]/85 px-4 py-2.5 backdrop-blur-md lg:hidden dark:border-stone-800 dark:bg-stone-950/85">
        <div className="flex items-center gap-2">
          <button type="button" className={btn.icon} onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu size={20} aria-hidden />
            {awaiting > 0 && <span className="absolute ml-5 -mt-5 size-2 rounded-full bg-amber-500" aria-hidden />}
          </button>
          <BrandMark tone="dark" />
        </div>
      </header>

      {menuOpen && (
        <Dialog title="Admin menu" variant="drawer" onClose={() => setMenuOpen(false)}>
          <SidebarBody items={items} active={active} onNavigate={() => setMenuOpen(false)} />
        </Dialog>
      )}

      <div className="lg:pl-[260px]">
        <main id="admin-main" className="mx-auto w-full max-w-[1360px] px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}

