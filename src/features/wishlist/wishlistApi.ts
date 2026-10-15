import { api, run } from '../../app/api'
import { wishlistRepository } from '../../repositories/wishlistRepository'
import type { ProductSummary } from '../../types/api'

export const wishlistApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<ProductSummary[], void>({
      queryFn: () => run(wishlistRepository.list()),
      providesTags: ['Wishlist'],
    }),
    addToWishlist: build.mutation<unknown, ProductSummary>({
      queryFn: (product) => run(wishlistRepository.add(product.id)),
      // Optimistic: the heart fills instantly, rolled back if the request fails.
      async onQueryStarted(product, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => {
            if (!draft.some((item) => item.id === product.id)) draft.unshift(product)
          }),
        )
        queryFulfilled.catch(patch.undo)
      },
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: build.mutation<unknown, string>({
      queryFn: (productId) => run(wishlistRepository.remove(productId)),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => draft.filter((item) => item.id !== productId)),
        )
        queryFulfilled.catch(patch.undo)
      },
      invalidatesTags: ['Wishlist'],
    }),
  }),
})

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } = wishlistApi
