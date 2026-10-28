import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/layout/Header'
import { RequireAdmin, RequireAuth } from './components/routing/RouteGuards'
import { PageLoader } from './components/ui/PageLoader'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { useKeepAlive } from './hooks/useKeepAlive'
import { useLenis } from './hooks/useLenis'
import { useReveal } from './hooks/useReveal'
import { useRoute } from './hooks/useRoute'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import type { Route } from './utils/router'

// Route-level code splitting: only the home page ships in the entry bundle.
function named<P extends object, K extends string>(load: () => Promise<{ [key in K]: ComponentType<P> }>, name: K) {
  return lazy(() => load().then((module) => ({ default: module[name] })))
}

const CategoryPage = named(() => import('./pages/CategoryPage'), 'CategoryPage')
const ProductDetailPage = named(() => import('./pages/ProductDetailPage'), 'ProductDetailPage')
const ContactPage = named(() => import('./pages/ContactPage'), 'ContactPage')
const GiftsPage = named(() => import('./pages/GiftsPage'), 'GiftsPage')
const WishlistPage = named(() => import('./pages/WishlistPage'), 'WishlistPage')
const AuthPage = named(() => import('./pages/auth/AuthPage'), 'AuthPage')
const AccountPage = named(() => import('./pages/account/AccountPage'), 'AccountPage')
const CartPage = named(() => import('./pages/checkout/CartPage'), 'CartPage')
const CheckoutPage = named(() => import('./pages/checkout/CheckoutPage'), 'CheckoutPage')
const PaymentPage = named(() => import('./pages/checkout/PaymentPage'), 'PaymentPage')
const OrderCompletePage = named(() => import('./pages/checkout/OrderCompletePage'), 'OrderCompletePage')
const OrderDetailPage = named(() => import('./pages/orders/OrderDetailPage'), 'OrderDetailPage')
const AdminApp = named(() => import('./pages/admin/AdminApp'), 'AdminApp')

const PAGE_ROUTES = new Set([
  'home', 'honey', 'shop', 'product', 'contact', 'gifts', 'return-gifts', 'cart', 'checkout', 'pay', 'order-complete', 'orders', 'wishlist',
  'account', 'my-account', 'admin', 'login', 'register', 'verify-email', 'forgot-password', 'reset-password',
])

type Resolved = { page: ReactNode; chrome?: boolean }

const AUTH_MODES = ['login', 'register', 'verify-email', 'forgot-password'] as const
type AuthMode = (typeof AUTH_MODES)[number]

/**
 * Hash routes. Unknown hashes fall back to the home page so in-page anchors
 * (#favorites, #trending, #gallery…) keep working.
 */
function resolve(route: Route): Resolved {
  const [head, second, ...rest] = route.segments
  switch (head) {
    case 'honey':
      return { page: <CategoryPage category="honey" /> }
    case 'shop':
      return { page: <CategoryPage category={second} /> }
    case 'product':
      return second ? { page: <ProductDetailPage key={second} slug={second} /> } : { page: <CategoryPage /> }
    case 'contact':
      return { page: <ContactPage /> }
    case 'gifts':
    case 'return-gifts':
      return { page: <GiftsPage /> }
    case 'cart':
      return { page: <CartPage /> }
    case 'checkout':
      return { page: <RequireAuth><CheckoutPage /></RequireAuth> }
    case 'pay':
      return { page: <RequireAuth><PaymentPage key={second} orderNumber={second ?? ''} /></RequireAuth> }
    case 'order-complete':
      return { page: <RequireAuth><OrderCompletePage key={second} orderNumber={second ?? ''} /></RequireAuth> }
    case 'orders':
      return second
        ? { page: <RequireAuth><OrderDetailPage key={second} orderNumber={second} /></RequireAuth> }
        : { page: <RequireAuth><AccountPage tab="orders" /></RequireAuth> }
    case 'wishlist':
      return { page: <RequireAuth><WishlistPage /></RequireAuth> }
    case 'account':
    case 'my-account':
      return { page: <RequireAuth><AccountPage tab={second} /></RequireAuth> }
    case 'admin':
      return { page: <RequireAdmin><AdminApp segments={[second, ...rest].filter(Boolean)} /></RequireAdmin>, chrome: false }
    case 'reset-password':
      return { page: <AuthPage mode="forgot-password" />, chrome: false }
    default:
      if ((AUTH_MODES as readonly string[]).includes(head)) return { page: <AuthPage mode={head as AuthMode} />, chrome: false }
      return { page: <HomePage /> }
  }
}

function App() {
  const route = useRoute()
  useKeepAlive()
  useLenis()
  useTheme()
  useReveal()

  // New page → start at the top (in-page anchors on the home page are left alone).
  useEffect(() => {
    if (route.segments.length && !PAGE_ROUTES.has(route.segments[0])) return
    const scrollToTop = () => {
      window.lenis?.scrollTo(0, { immediate: true })
      window.scrollTo(0, 0)
    }
    scrollToTop()
    const timer = setTimeout(scrollToTop, 50)
    return () => clearTimeout(timer)
    // Only the path matters; query changes (filters, tabs) keep the scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path])

  const { page, chrome = true } = resolve(route)

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-stone-950 dark:text-stone-50">
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        expand={false}
        gap={12}
        toastOptions={{
          duration: 3500,
          classNames: {
            toast: 'sonner-toast-luxury',
            title: 'sonner-title',
            description: 'sonner-description',
            closeButton: 'sonner-close',
          },
          style: {
            borderRadius: '16px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            padding: '14px 16px',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(16px)',
            minWidth: '300px',
          },
        }}
      />
      {chrome && <ScrollProgress route={route.hash} />}
      {chrome && <Header />}
      <Suspense fallback={<PageLoader />}>{page}</Suspense>
    </div>
  )
}

export default App
