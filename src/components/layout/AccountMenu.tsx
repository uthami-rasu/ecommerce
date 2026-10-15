import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LayoutDashboard, LogOut, MapPin, Package, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { signOut } from '../../features/auth/authSlice'
import { useAuth } from '../../hooks/useAuth'
import { initials } from '../../utils/format'
import { loginHref } from '../../utils/router'

/** Header account control: "Sign in" for guests, avatar + menu for signed-in users. */
export function AccountMenu() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth()
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  if (isLoading) return <span className="icon-button opacity-40" aria-hidden="true"><UserRound size={18} /></span>

  if (!isAuthenticated || !user) {
    return (
      <a className="icon-button group relative" aria-label="Sign in" href={loginHref()} title="Sign in">
        <UserRound className="transition group-hover:-translate-y-0.5 group-hover:scale-110" size={18} />
      </a>
    )
  }

  const links = [
    { label: 'My account', href: '#account', icon: UserRound },
    { label: 'Orders & tracking', href: '#account/orders', icon: Package },
    { label: 'Addresses', href: '#account/addresses', icon: MapPin },
    ...(isAdmin ? [{ label: 'Admin dashboard', href: '#admin', icon: LayoutDashboard }] : []),
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="ml-1 flex items-center gap-1.5 rounded-full p-1 pr-2 transition hover:bg-stone-100 dark:hover:bg-stone-800"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user.avatarUrl ? (
          <img className="size-8 rounded-full object-cover ring-2 ring-amber-200/70" src={user.avatarUrl} alt="" />
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-[#173f32] text-[11px] font-bold text-amber-200">{initials(user)}</span>
        )}
        <ChevronDown size={14} className={`hidden text-stone-500 transition sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-[70] w-64 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-2 shadow-[0_24px_60px_rgba(15,35,27,.18)] backdrop-blur-xl dark:border-stone-700 dark:bg-stone-900/95"
        >
          <div className="px-3 pb-3 pt-2">
            <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-100">{user.displayName || `${user.firstName} ${user.lastName}`}</p>
            <p className="truncate text-xs text-stone-500">{user.email}</p>
          </div>
          <div className="border-t border-stone-100 pt-1.5 dark:border-stone-800">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                role="menuitem"
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-amber-50 hover:text-[#173f32] dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <Icon size={16} /> {label}
              </a>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                dispatch(signOut())
                toast.success('Signed out', { description: 'See you soon!' })
                window.location.hash = '#home'
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
