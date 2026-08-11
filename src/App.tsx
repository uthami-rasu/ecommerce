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
      <Toaster position="top-right" richColors closeButton toastOptions={{ style: { borderRadius: '12px', fontFamily: 'var(--font-sans)' } }} />
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
