import { CheckCircle2, CircleX, PackageCheck, Package, Truck, Navigation, type LucideIcon } from 'lucide-react'
import type { OrderStatus } from '../../types/api'

export type TransitionMeta = {
  /** Button label, e.g. "Confirm order". */
  label: string
  /** Compact label for the list's quick action. */
  short: string
  /** Dialog title. */
  title: string
  description: string
  icon: LucideIcon
  danger?: boolean
  /** The backend emails the customer for this change (when notifyCustomer is not false). */
  emails: boolean
}

export const TRANSITION_META: Partial<Record<OrderStatus, TransitionMeta>> = {
  processing: {
    label: 'Confirm order',
    short: 'Confirm',
    title: 'Confirm this order',
    description: 'Accept the order and start preparing it. The customer sees “Confirmed” on their order page.',
    icon: CheckCircle2,
    emails: false,
  },
  packed: {
    label: 'Mark as packed',
    short: 'Pack',
    title: 'Mark as packed',
    description: 'Items are picked, packed and ready to hand over to the courier.',
    icon: Package,
    emails: false,
  },
  shipped: {
    label: 'Ship order',
    short: 'Ship',
    title: 'Ship this order',
    description: 'Hand the parcel to the courier. Add tracking so the customer can follow it.',
    icon: Truck,
    emails: true,
  },
  out_for_delivery: {
    label: 'Out for delivery',
    short: 'Out for delivery',
    title: 'Mark out for delivery',
    description: 'The parcel is with the delivery agent and will arrive today.',
    icon: Navigation,
    emails: true,
  },
  delivered: {
    label: 'Mark delivered',
    short: 'Delivered',
    title: 'Mark as delivered',
    description: 'The customer has received the parcel. This completes the order.',
    icon: PackageCheck,
    emails: true,
  },
  cancelled: {
    label: 'Cancel order',
    short: 'Cancel',
    title: 'Cancel this order',
    description: 'The order is closed and can’t be reopened.',
    icon: CircleX,
    danger: true,
    emails: true,
  },
}

/**
 * The single obvious next step on the happy path (used for the quick action in the
 * orders list). Mirrors the backend's admin transitions; the server still validates.
 */
export const PRIMARY_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: 'processing',
  processing: 'packed',
  packed: 'shipped',
  shipped: 'out_for_delivery',
  out_for_delivery: 'delivered',
}
