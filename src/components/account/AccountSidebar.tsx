import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { BadgeCheck, Camera, CircleAlert, LayoutDashboard, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { useUploadAvatarMutation } from '../../features/account/accountApi'
import { signOut, userUpdated } from '../../features/auth/authSlice'
import { errorMessage } from '../../lib/http/apiClient'
import type { UserProfile } from '../../types/api'
import { formatDate, fullName, initials } from '../../utils/format'
import { navigate } from '../../utils/router'
import { cardClass } from './AccountSection'
import { ACCOUNT_TABS, type AccountTab } from './accountTabs'

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_BYTES = 5 * 1024 * 1024

function AvatarUpload({ user }: { user: UserProfile }) {
  const dispatch = useAppDispatch()
  const input = useRef<HTMLInputElement>(null)
  const [upload, { isLoading }] = useUploadAvatarMutation()
  const [preview, setPreview] = useState<string | null>(null)

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error('Unsupported image', { description: 'Choose a JPEG, PNG or WebP photo.' })
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('Photo is too large', { description: 'Choose an image under 5 MB.' })
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    try {
      const profile = await upload(file).unwrap()
      dispatch(userUpdated(profile))
      toast.success('Profile photo updated')
    } catch (error) {
      toast.error('Could not upload photo', { description: errorMessage(error) })
    } finally {
      setPreview(null)
      URL.revokeObjectURL(objectUrl)
    }
  }

  const src = preview ?? user.avatarUrl
  return (
    <div className="relative shrink-0">
      <div className="rounded-full bg-gradient-to-br from-[#D9B27C] via-[#f3dfb9] to-[#173f32] p-[3px] shadow-[0_12px_30px_-12px_rgba(23,63,50,0.6)]">
        {src ? (
          <img src={src} alt="" className={`size-20 rounded-full border-[3px] sm:size-24 border-white object-cover dark:border-stone-900 ${isLoading ? 'opacity-60' : ''}`} />
        ) : (
          <span className="grid size-20 place-items-center rounded-full border-[3px] sm:size-24 border-white bg-[#173f32] font-display text-3xl font-bold text-amber-100 dark:border-stone-900" aria-hidden="true">
            {initials(user)}
          </span>
        )}
        {isLoading && (
          <span className="absolute inset-0 grid place-items-center" role="status" aria-label="Uploading photo">
            <span className="size-8 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={isLoading}
        className="absolute bottom-0.5 right-0.5 grid size-9 place-items-center rounded-full border-2 border-white bg-[#173f32] text-white shadow-md transition hover:scale-105 hover:bg-[#1e5040] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/50 disabled:opacity-60 dark:border-stone-900"
        aria-label="Change profile photo"
        title="Change profile photo (JPEG, PNG or WebP, up to 5 MB)"
      >
        <Camera size={15} />
      </button>
      <input ref={input} type="file" accept={AVATAR_TYPES.join(',')} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={choose} />
    </div>
  )
}

export function AccountSidebar({ user, active, isAdmin }: { user: UserProfile; active: AccountTab; isAdmin: boolean }) {
  const dispatch = useAppDispatch()
  const name = user.displayName || fullName(user)
  const nav = useRef<HTMLElement>(null)

  // Mobile: the tab strip scrolls sideways; keep the active tab in view.
  useEffect(() => {
    const strip = nav.current
    const current = strip?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!strip || !current || strip.scrollWidth <= strip.clientWidth) return
    strip.scrollLeft = current.offsetLeft - (strip.clientWidth - current.offsetWidth) / 2
  }, [active])

  const logOut = async () => {
    // Leave the protected route first so the auth guard doesn't bounce us to #login.
    const left = new Promise((resolve) => {
      window.addEventListener('hashchange', resolve, { once: true })
      window.setTimeout(resolve, 300)
    })
    navigate('home')
    await left
    await dispatch(signOut())
    toast.success('Signed out', { description: 'See you again soon.' })
  }

  const navItem = (isActive: boolean) =>
    `group flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/30 lg:rounded-xl ${
      isActive
        ? 'bg-[#173f32] text-white shadow-[0_8px_20px_-10px_rgba(23,63,50,0.8)] dark:bg-amber-200/15 dark:text-amber-100'
        : 'text-stone-600 hover:bg-[#173f32]/6 hover:text-[#173f32] dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-white'
    }`

  return (
    <aside className="min-w-0 lg:sticky lg:top-28">
      <div className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center gap-4 lg:flex-col lg:text-center">
          <AvatarUpload user={user} />
          <div className="min-w-0 lg:w-full">
            <h2 className="truncate font-display text-2xl font-bold leading-tight text-stone-900 dark:text-stone-50" title={name}>{name}</h2>
            <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400" title={user.email}>{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 lg:justify-center">
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800">
                  <BadgeCheck size={13} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800">
                  <CircleAlert size={13} /> Unverified
                </span>
              )}
              <span className="text-[11px] font-medium text-stone-400">Member since {formatDate(user.createdAt, { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <nav ref={nav} aria-label="Account sections" className="account-tabs-scroll relative -mx-5 mt-5 flex gap-1.5 overflow-x-auto border-t border-stone-200/70 px-5 pt-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 dark:border-stone-800">
          {ACCOUNT_TABS.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#account/${id}`} aria-current={active === id ? 'page' : undefined} className={navItem(active === id)}>
              <Icon size={17} aria-hidden="true" />
              {label}
            </a>
          ))}
          {isAdmin && (
            <a href="#admin" className={navItem(false)}>
              <LayoutDashboard size={17} aria-hidden="true" />
              Admin dashboard
            </a>
          )}
          <span className="hidden h-px bg-stone-200/70 lg:my-2 lg:block dark:bg-stone-800" aria-hidden="true" />
          <button
            type="button"
            onClick={logOut}
            className="flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-stone-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 lg:rounded-xl dark:text-stone-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
          >
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </button>
        </nav>
      </div>
    </aside>
  )
}
