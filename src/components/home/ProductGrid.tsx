import type { ProductSummary } from '../../types/api'
import { HomeCardSkeleton } from '../catalog/Skeletons'
import { useQuickAdd } from '../catalog/useQuickAdd'
import { useWishlist } from '../../hooks/useWishlist'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  products: ProductSummary[] | undefined
  loading?: boolean
  skeletons?: number
}

export function ProductGrid({ products, loading = false, skeletons = 8 }: ProductGridProps) {
  const { quickAdd, isAdding } = useQuickAdd()
  const { isWished, toggle } = useWishlist()

  return (
    <div className="mx-auto grid max-w-[1340px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" aria-busy={loading}>
      {loading || !products
        ? Array.from({ length: skeletons }, (_, index) => <HomeCardSkeleton key={index} />)
        : products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            wished={isWished(product.id)}
            adding={isAdding(product.id)}
            onWish={() => toggle(product)}
            onAdd={() => quickAdd(product)}
          />
        ))}
    </div>
  )
}
