/**
 * Shapes returned by the Bossco Commerce API (`/api/v1`). Money is in rupees,
 * dates are ISO strings. Keep in sync with the backend mappers.
 */

export type Paginated<T> = {
  data: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export type PageQuery = { page?: number; limit?: number }

// ── Auth & users ─────────────────────────────────────────

export type Role = 'customer' | 'admin'

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string | null
  phone: string | null
  avatarUrl: string | null
  role: Role
  emailVerified: boolean
  createdAt: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: UserProfile
}

export type OtpPurpose = 'verify_email' | 'reset_password' | 'change_email'

export type OtpChallenge = {
  email: string
  purpose: OtpPurpose
  expiresInSeconds: number
  resendAfterSeconds: number
}

export type RegisterInput = { email: string; password: string; firstName: string; lastName: string }
export type LoginInput = { email: string; password: string }
export type ResetPasswordInput = { email: string; code: string; newPassword: string }
export type UpdateProfileInput = Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'displayName' | 'phone'>>

export type AddressFields = {
  firstName: string
  lastName: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postalCode: string
  /** ISO 3166-1 alpha-2, defaults to IN. */
  country?: string
}

export type Address = AddressFields & {
  id: string
  label: string | null
  country: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}

export type AddressInput = AddressFields & {
  label?: string
  isDefaultShipping?: boolean
  isDefaultBilling?: boolean
}

// ── Catalog ──────────────────────────────────────────────

export type ImageView = {
  id: string
  url: string
  mediumUrl: string
  thumbUrl: string
  alt: string | null
}

export type CategoryRef = { id: string; name: string; slug: string }

export type Category = CategoryRef & {
  description: string | null
  imageUrl: string | null
  productCount: number
  children: Category[]
}

export type ProductSummary = {
  id: string
  slug: string
  name: string
  subtitle: string | null
  origin: string | null
  badge: string | null
  category: CategoryRef
  image: ImageView | null
  price: number
  compareAtPrice: number | null
  discountPercent: number
  rating: number
  reviewCount: number
  inStock: boolean
  sizes: string[]
  defaultVariantId: string | null
}

export type Variant = {
  id: string
  label: string
  sku: string
  price: number
  compareAtPrice: number | null
  inStock: boolean
  lowStock: boolean
}

export type ProductDetail = ProductSummary & {
  description: string | null
  images: ImageView[]
  variants: Variant[]
  similar: ProductSummary[]
}

/** Lightweight row from `/products/suggest` (header search). */
export type ProductSuggestion = { id: string; slug: string; name: string; category: string; price: number; thumbUrl: string | null }

export type ProductSort = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'

export type ProductQuery = PageQuery & {
  search?: string
  /** Category slug; a parent slug includes its sub-categories. */
  category?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  minRating?: number
  sort?: ProductSort
  featured?: boolean
  trending?: boolean
  inStock?: boolean
}

export type Review = {
  id: string
  rating: number
  title: string
  content: string
  isVerifiedPurchase: boolean
  author: { name: string; initials: string }
  createdAt: string
}

export type ReviewSummary = {
  average: number
  count: number
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>
}

export type ReviewPage = Paginated<Review> & { summary: ReviewSummary }

export type ReviewInput = { rating: number; title: string; content: string }

// ── Cart ─────────────────────────────────────────────────

export type ShippingMethod = 'standard' | 'express' | 'pickup'

export type CartLine = {
  id: string
  variantId: string
  productId: string
  slug: string
  name: string
  variantLabel: string
  imageUrl: string | null
  unitPrice: number
  compareAtPrice: number | null
  quantity: number
  lineTotal: number
  maxQuantity: number
  available: boolean
  issue: string | null
}

export type Cart = {
  items: CartLine[]
  itemCount: number
  currency: 'INR'
  subtotal: number
  discount: number
  shippingMethod: ShippingMethod
  shippingFee: number
  total: number
  coupon: { code: string; discount: number } | null
  couponError: string | null
  shippingOptions: Array<{ method: ShippingMethod; label: string; fee: number }>
}

export type CartItemInput = { variantId: string; quantity: number }

// ── Orders & payments ────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'paid'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'created' | 'pending' | 'succeeded' | 'failed'

export type OrderAddress = {
  firstName: string
  lastName: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

export type OrderItem = {
  id: string
  productId: string | null
  productSlug: string
  productName: string
  variantLabel: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type OrderTracking = {
  carrier: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  estimatedDeliveryAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
}

export type OrderEvent = {
  id: string
  /** null for tracking updates / notes that do not change the status. */
  status: OrderStatus | null
  title: string
  note: string | null
  actor: 'system' | 'customer' | 'admin'
  createdAt: string
}

export type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus | null
  currency: string
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  couponCode: string | null
  shippingMethod: ShippingMethod
  shippingAddress: OrderAddress
  billingAddress: OrderAddress
  contactEmail: string
  notes: string | null
  itemCount: number
  items: OrderItem[]
  createdAt: string
  paidAt: string | null
  cancelledAt: string | null
  tracking: OrderTracking
  /** Present on detail endpoints only, oldest first. */
  timeline?: OrderEvent[]
}

export type CheckoutInput = {
  shippingAddressId?: string
  shippingAddress?: AddressFields
  billingAddressId?: string
  billingAddress?: AddressFields
  shippingMethod?: ShippingMethod
  email?: string
  notes?: string
}

export type MockOutcome = 'success' | 'failure' | 'pending'

export type Payment = {
  id: string
  orderNumber: string
  provider: string
  providerOrderId: string
  status: PaymentStatus
  amount: number
  currency: string
  failureReason: string | null
}

export type PaymentInitiation = Payment & { checkout: Record<string, unknown> }

export type MockCheckoutResult = { providerOrderId: string; providerPaymentId: string; signature: string }

// ── Admin ────────────────────────────────────────────────

export type AdminOrderListItem = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus | null
  customerName: string
  contactEmail: string
  itemCount: number
  total: number
  createdAt: string
  tracking?: OrderTracking
}

export type AdminOrderDetail = Order & {
  allowedTransitions: OrderStatus[]
  customer?: { id: string; email: string; firstName: string; lastName: string; phone: string | null } | null
}

export type AdminOrderQuery = PageQuery & { status?: OrderStatus; search?: string; from?: string; to?: string }

export type TrackingInput = {
  carrier?: string
  trackingNumber?: string
  trackingUrl?: string
  /** ISO date-time, must not be in the past. */
  estimatedDeliveryAt?: string
  note?: string
  notifyCustomer?: boolean
}

export type UpdateOrderStatusInput = TrackingInput & { status: OrderStatus }

export type OrderEventInput = { title?: string; note: string; notifyCustomer?: boolean }

export type Dashboard = {
  totals: { products: number; activeProducts: number; categories: number; customers: number; orders: number }
  revenue: { allTime: number; last30Days: number; averageOrderValue: number }
  ordersByStatus: Partial<Record<OrderStatus, number>>
  salesLast30Days: Array<{ date: string; orders: number; revenue: number }>
  [key: string]: unknown
}
