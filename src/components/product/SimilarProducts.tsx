import { ChevronRight, Loader2, PackageCheck, Plus } from 'lucide-react'
import type { ProductSummary } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { ProductImage } from '../catalog/ProductImage'
import { useQuickAdd } from '../catalog/useQuickAdd'

type SimilarProductsProps = {
  products: ProductSummary[]
  viewAllHref: string
  viewAllLabel: string
}

export function SimilarProducts({ products, viewAllHref, viewAllLabel }: SimilarProductsProps) {
  const { quickAdd, isAdding } = useQuickAdd()
  if (!products.length) return null
  return (
    <section className="similar-section" aria-labelledby="similar-heading">
      <div className="similar-heading">
        <div><span><PackageCheck size={14} /> Curated for you</span><h2 id="similar-heading">Similar Items You Might Also Like</h2></div>
        <a href={viewAllHref}>{viewAllLabel} <ChevronRight size={14} /></a>
      </div>
      <div className="similar-products">
        {products.slice(0, 4).map((product) => {
          const adding = isAdding(product.id)
          return (
            <article className="similar-product" key={product.id}>
              <a className="similar-product-image" href={`#product/${product.slug}`} tabIndex={-1} aria-hidden="true">
                <ProductImage image={product.image} alt={product.name} sizes="(min-width: 900px) 280px, 50vw" />
              </a>
              <span className="similar-category">{product.category.name}</span>
              <button type="button" onClick={() => quickAdd(product)} disabled={adding || !product.inStock} aria-busy={adding} aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is sold out`}>
                {adding ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              </button>
              <a href={`#product/${product.slug}`}>
                <strong>{product.name}</strong>
                <small>{product.inStock ? product.sizes.join(' · ') : 'Sold out'}</small>
                <b>{formatMoney(product.price)}</b>
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}
