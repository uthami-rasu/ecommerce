import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useAddToWishlistMutation, useGetWishlistQuery, useRemoveFromWishlistMutation } from '../features/wishlist/wishlistApi'
import { errorMessage } from '../lib/http/apiClient'
import type { ProductSummary } from '../types/api'
import { loginHref } from '../utils/router'
import { useAuth } from './useAuth'

/** Wishlist is account-only; guests are invited to sign in. */
export function useWishlist() {
  const { isAuthenticated } = useAuth()
  const query = useGetWishlistQuery(undefined, { skip: !isAuthenticated })
  const [add] = useAddToWishlistMutation()
  const [remove] = useRemoveFromWishlistMutation()
  const items = useMemo(() => (isAuthenticated ? query.data ?? [] : []), [isAuthenticated, query.data])
  const ids = useMemo(() => new Set(items.map((item) => item.id)), [items])

  const toggle = useCallback(
    async (product: ProductSummary) => {
      if (!isAuthenticated) {
        toast('Sign in to save favourites', {
          description: 'Your wishlist is kept safe in your account.',
          action: { label: 'Sign in', onClick: () => (window.location.hash = loginHref()) },
        })
        return
      }
      const saved = ids.has(product.id)
      try {
        if (saved) {
          await remove(product.id).unwrap()
          toast.info('Removed from wishlist', { description: product.name })
        } else {
          await add(product).unwrap()
          toast.success('Saved to wishlist', { description: product.name })
        }
      } catch (error) {
        toast.error('Could not update wishlist', { description: errorMessage(error) })
      }
    },
    [isAuthenticated, ids, add, remove],
  )

  return {
    items,
    count: items.length,
    isLoading: isAuthenticated && query.isLoading,
    isWished: (productId: string) => ids.has(productId),
    toggle,
  }
}
