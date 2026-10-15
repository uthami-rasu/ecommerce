import { useEffect } from 'react'
import { AccountSection } from '../../components/account/AccountSection'
import { AccountSidebar } from '../../components/account/AccountSidebar'
import { ACCOUNT_TABS, isAccountTab, type AccountTab } from '../../components/account/accountTabs'
import { AddressesTab } from '../../components/account/AddressesTab'
import { ChangeEmailCard } from '../../components/account/ChangeEmailCard'
import { ChangePasswordCard } from '../../components/account/ChangePasswordCard'
import { ProfileTab } from '../../components/account/ProfileTab'
import { WishlistTab } from '../../components/account/WishlistTab'
import { OrderHistory } from '../../components/orders/OrderHistory'
import { PageLoader } from '../../components/ui/PageLoader'
import { useAuth } from '../../hooks/useAuth'
import type { UserProfile } from '../../types/api'
import '../../styles/auth.css'
import '../../styles/account.css'

function TabContent({ tab, user }: { tab: AccountTab; user: UserProfile }) {
  switch (tab) {
    case 'orders':
      return (
        <AccountSection title="Orders" description="Track deliveries and pay for pending orders.">
          <OrderHistory />
        </AccountSection>
      )
    case 'addresses':
      return <AddressesTab user={user} />
    case 'wishlist':
      return <WishlistTab />
    case 'security':
      return (
        <div className="space-y-6">
          <ChangePasswordCard />
          <ChangeEmailCard user={user} />
        </div>
      )
    default:
      // Keyed on the saved values so the form resets after a save or an update from elsewhere.
      return <ProfileTab key={`${user.id}:${user.firstName}:${user.lastName}:${user.displayName}:${user.phone}`} user={user} />
  }
}

/** #account/<tab> — tabs live in the hash, so back / forward move between them. */
export function AccountPage({ tab }: { tab?: string }) {
  const { user, isAdmin } = useAuth()
  const active: AccountTab = isAccountTab(tab) ? tab : 'profile'
  const label = ACCOUNT_TABS.find((item) => item.id === active)?.label

  useEffect(() => {
    document.title = `${label} · My account · Bossco`
  }, [label])

  if (!user) return <PageLoader />

  return (
    <main className="account-root account-canvas min-h-[75vh] overflow-hidden text-stone-900 dark:text-stone-100">
      <div className="mx-auto w-[min(1180px,calc(100%-2rem))] pb-24 pt-10 sm:pt-14">
        <header className="mb-8 sm:mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#aa753a] dark:text-[#e4c08d]">My account</p>
          <h1 className="mt-2 font-display text-[2.6rem] font-bold leading-none text-[#173f32] sm:text-[3.4rem] dark:text-stone-50">
            Hello, {user.displayName || user.firstName}
          </h1>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-8">
          <AccountSidebar user={user} active={active} isAdmin={isAdmin} />
          <div key={active} className="account-swap min-w-0">
            <TabContent tab={active} user={user} />
          </div>
        </div>
      </div>
    </main>
  )
}
