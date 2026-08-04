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
import { CartPage, CheckoutPage, OrderCompletePage, WishlistPage } from './pages/CommercePages'
import { ContactPage } from './pages/ContactPage'

function App() {
  const [route, setRoute] = useState(() => window.location.hash)
  useLenis()
  useTheme()
  useReveal()

  useEffect(() => {
    const handleRoute = () => {
      setRoute(window.location.hash)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', handleRoute)
    return () => window.removeEventListener('hashchange', handleRoute)
  }, [])

  const productSlug = route.startsWith('#product/') ? decodeURIComponent(route.slice('#product/'.length)) : null
  const selectedProduct = productSlug ? honeyProducts.find((product) => product.slug === productSlug) : undefined

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-stone-950 dark:text-stone-50">
      <ScrollProgress />
      <Header />
      {selectedProduct ? <ProductDetailPage product={selectedProduct} products={honeyProducts} /> : route === '#cart' ? <CartPage products={honeyProducts} /> : route === '#checkout' ? <CheckoutPage products={honeyProducts} /> : route === '#order-complete' ? <OrderCompletePage products={honeyProducts} /> : route === '#wishlist' ? <WishlistPage products={honeyProducts} /> : route === '#contact' ? <ContactPage /> : route === '#honey' ? <CategoryPage /> : <HomePage />}
    </div>
  )
}

export default App
