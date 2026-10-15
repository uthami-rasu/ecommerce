import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { catalogApi } from '../../features/catalog/catalogApi'
import { useCart } from '../../hooks/useCart'
import { errorMessage } from '../../lib/http/apiClient'
import type { ProductDetail, ProductSummary, Variant } from '../../types/api'

/** The variant a one-tap "Add" should use: the default if purchasable, else the first in stock. */
export const defaultVariantOf = (product: Pick<ProductDetail, 'variants' | 'defaultVariantId'>): Variant | undefined => {
  const preferred = product.variants.find((variant) => variant.id === product.defaultVariantId)
  return preferred?.inStock ? preferred : product.variants.find((variant) => variant.inStock)
}

/**
 * One-tap add-to-cart from a product card. Cards only carry a `ProductSummary`, so the
 * full variant (label, price) is resolved from the product detail, which RTK Query
 * caches — the PDP opens instantly afterwards. Tracks a pending flag per product.
 */
export function useQuickAdd() {
  const dispatch = useAppDispatch()
  const { add } = useCart()
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set())

  const setBusy = useCallback((id: string, busy: boolean) => {
    setPending((current) => {
      const next = new Set(current)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const quickAdd = useCallback(
    async (product: ProductSummary, quantity = 1, options: { silent?: boolean } = {}) => {
      if (!product.inStock) {
        if (!options.silent) toast.error('Out of stock', { description: `${product.name} is currently unavailable.` })
        return false
      }
      setBusy(product.id, true)
      const subscription = dispatch(catalogApi.endpoints.getProduct.initiate(product.slug))
      try {
        const detail = await subscription.unwrap()
        const variant = defaultVariantOf(detail)
        if (!variant) {
          if (!options.silent) toast.error('Out of stock', { description: `${product.name} is currently unavailable.` })
          return false
        }
        return await add({ product, variant, quantity }, options)
      } catch (error) {
        toast.error('Could not add to cart', { description: errorMessage(error) })
        return false
      } finally {
        subscription.unsubscribe()
        setBusy(product.id, false)
      }
    },
    [dispatch, add, setBusy],
  )

  const isAdding = useCallback((productId: string) => pending.has(productId), [pending])

  return { quickAdd, isAdding }
}
