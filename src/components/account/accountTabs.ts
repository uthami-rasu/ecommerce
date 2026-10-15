import { Heart, MapPin, Package, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react'

export type AccountTab = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'security'

export const ACCOUNT_TABS: Array<{ id: AccountTab; label: string; icon: LucideIcon }> = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'security', label: 'Security', icon: ShieldCheck },
]

export const isAccountTab = (value: string | undefined): value is AccountTab => ACCOUNT_TABS.some((tab) => tab.id === value)
