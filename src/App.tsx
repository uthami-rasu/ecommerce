import { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { useLenis } from './hooks/useLenis'
import { useTheme } from './hooks/useTheme'
import { useReveal } from './hooks/useReveal'
import { CategoryPage } from './pages/CategoryPage'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { honeyProducts } from './constants/honeyProducts'
import { CartPage, CheckoutPage, MyAccountPage, OrderCompletePage, WishlistPage } from './pages/CommercePages'
import { ContactPage } from './pages/ContactPage'

import { Toaster } from 'sonner'

function App() {
  const [route, setRoute] = useState(() => window.location.hash)
  useLenis()
  useTheme()
  useReveal()

  useEffect(() => {
    const handleRoute = () => {
      setRoute(window.location.hash)
    }
    window.addEventListener('hashchange', handleRoute)
    return () => window.removeEventListener('hashchange', handleRoute)
  }, [])

  useEffect(() => {
    const scrollToTop = () => {
      const lenis = (window as any).lenis
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(0, { immediate: true })
      }
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    scrollToTop()
    const timer = setTimeout(scrollToTop, 50)
    return () => clearTimeout(timer)
  }, [route])

  const productSlug = route.startsWith('#product/') ? decodeURIComponent(route.slice('#product/'.length)) : null
  const selectedProduct = productSlug ? honeyProducts.find((product) => product.slug === productSlug) : undefined

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
      <ScrollProgress route={route} />
      <Header />
      {selectedProduct ? (
        <ProductDetailPage product={selectedProduct} products={honeyProducts} />
      ) : route === '#cart' ? (
        <CartPage products={honeyProducts} />
      ) : route === '#checkout' ? (
        <CheckoutPage products={honeyProducts} />
      ) : route === '#order-complete' ? (
        <OrderCompletePage products={honeyProducts} />
      ) : route === '#wishlist' ? (
        <WishlistPage products={honeyProducts} />
      ) : route === '#account' || route === '#my-account' ? (
        <MyAccountPage products={honeyProducts} />
      ) : route === '#contact' ? (
        <ContactPage />
      ) : route === '#honey' ? (
        <CategoryPage />
      ) : (
        <HomePage />
      )}
    </div>
  )
}

export default App
