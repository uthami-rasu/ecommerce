import { api, run } from '../../app/api'
import { cartRepository } from '../../repositories/cartRepository'
import type { Cart, CartItemInput, ShippingMethod } from '../../types/api'

/** Server cart (signed-in users). Guests use `guestCartSlice`; `useCart` hides the difference. */
export const cartApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<Cart, ShippingMethod | void>({
      queryFn: (shippingMethod) => run(cartRepository.get(shippingMethod ?? undefined)),
      providesTags: ['Cart'],
    }),
    addCartItem: build.mutation<Cart, CartItemInput>({
      queryFn: (input) => run(cartRepository.addItem(input)),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: build.mutation<Cart, { id: string; quantity: number }>({
      queryFn: ({ id, quantity }) => run(cartRepository.updateItem(id, quantity)),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: build.mutation<Cart, string>({
      queryFn: (id) => run(cartRepository.removeItem(id)),
      invalidatesTags: ['Cart'],
    }),
    clearCart: build.mutation<void, void>({
      queryFn: () => run(cartRepository.clear()),
      invalidatesTags: ['Cart'],
    }),
    applyCoupon: build.mutation<Cart, string>({
      queryFn: (code) => run(cartRepository.applyCoupon(code)),
      invalidatesTags: ['Cart'],
    }),
    removeCoupon: build.mutation<Cart, void>({
      queryFn: () => run(cartRepository.removeCoupon()),
      invalidatesTags: ['Cart'],
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} = cartApi
