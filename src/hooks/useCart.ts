import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  useAddCartItemMutation, useGetCartQuery, useRemoveCartItemMutation, useUpdateCartItemMutation,
} from '../features/cart/cartApi'
import { guestItemAdded, guestItemRemoved, guestQuantitySet, MAX_LINE_QUANTITY, type GuestCartLine } from '../features/cart/guestCartSlice'
import { errorMessage } from '../lib/http/apiClient'
import type { Cart, CartLine, ProductSummary, ShippingMethod, Variant } from '../types/api'
import { useAuth } from './useAuth'

const guestLineView = (line: GuestCartLine): CartLine => ({
  // Guest lines are keyed by variant; the id is what update/remove receive.
  id: line.variantId,
  variantId: line.variantId,
  productId: line.productId,
  slug: line.slug,
  name: line.name,
  variantLabel: line.variantLabel,
  imageUrl: line.imageUrl,
  unitPrice: line.unitPrice,
  compareAtPrice: line.compareAtPrice,
  quantity: line.quantity,
  lineTotal: line.unitPrice * line.quantity,
  maxQuantity: MAX_LINE_QUANTITY,
  available: true,
  issue: null,
})

/** A guest cart in the same shape as the server cart; shipping & coupons are settled after sign-in. */
const guestCartView = (lines: GuestCartLine[]): Cart => {
  const items = lines.map(guestLineView)
  const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0)
  return {
    items,
    itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
    currency: 'INR',
    subtotal,
    discount: 0,
    shippingMethod: 'standard',
    shippingFee: 0,
    total: subtotal,
    coupon: null,
    couponError: null,
    shippingOptions: [],
  }
}

export type AddToCartInput = {
  product: Pick<ProductSummary, 'id' | 'slug' | 'name' | 'image'>
  variant: Pick<Variant, 'id' | 'label' | 'price' | 'compareAtPrice'>
  quantity?: number
}

/**
 * One cart API for the whole UI. Signed-in users get the server cart (prices, stock,
 * coupons and shipping computed by the API); guests get a browser cart that is merged
 * into their account when they sign in.
 */
export function useCart(shippingMethod?: ShippingMethod) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const dispatch = useAppDispatch()
  const guestLines = useAppSelector((state) => state.guestCart.lines)
  const server = useGetCartQuery(shippingMethod, { skip: !isAuthenticated })
  const [addItem, addState] = useAddCartItemMutation()
  const [updateItem, updateState] = useUpdateCartItemMutation()
  const [removeItem, removeState] = useRemoveCartItemMutation()

  const cart = useMemo<Cart | undefined>(
    () => (isAuthenticated ? server.data : authLoading ? undefined : guestCartView(guestLines)),
    [isAuthenticated, authLoading, server.data, guestLines],
  )

  const add = useCallback(
    async ({ product, variant, quantity = 1 }: AddToCartInput, options: { silent?: boolean } = {}) => {
      try {
        if (isAuthenticated) {
          await addItem({ variantId: variant.id, quantity }).unwrap()
        } else {
          dispatch(guestItemAdded({
            variantId: variant.id,
            quantity,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            variantLabel: variant.label,
            imageUrl: product.image?.thumbUrl ?? product.image?.url ?? null,
            unitPrice: variant.price,
            compareAtPrice: variant.compareAtPrice,
          }))
        }
        if (!options.silent) toast.success('Added to cart', { description: `${quantity} × ${product.name} (${variant.label})` })
        return true
      } catch (error) {
        toast.error('Could not add to cart', { description: errorMessage(error) })
        return false
      }
    },
    [isAuthenticated, addItem, dispatch],
  )

  const setQuantity = useCallback(
    async (line: CartLine, quantity: number) => {
      if (quantity < 1) return
      try {
        if (isAuthenticated) await updateItem({ id: line.id, quantity }).unwrap()
        else dispatch(guestQuantitySet({ variantId: line.variantId, quantity }))
      } catch (error) {
        toast.error('Could not update quantity', { description: errorMessage(error) })
      }
    },
    [isAuthenticated, updateItem, dispatch],
  )

  const remove = useCallback(
    async (line: CartLine) => {
      try {
        if (isAuthenticated) await removeItem(line.id).unwrap()
        else dispatch(guestItemRemoved(line.variantId))
        toast.info('Removed from cart', { description: line.name })
      } catch (error) {
        toast.error('Could not remove item', { description: errorMessage(error) })
      }
    },
    [isAuthenticated, removeItem, dispatch],
  )

  return {
    cart,
    count: cart?.itemCount ?? 0,
    isGuest: !isAuthenticated,
    isLoading: authLoading || (isAuthenticated && server.isLoading),
    isFetching: server.isFetching,
    isMutating: addState.isLoading || updateState.isLoading || removeState.isLoading,
    error: server.error,
    refetch: server.refetch,
    add,
    setQuantity,
    remove,
  }
}
