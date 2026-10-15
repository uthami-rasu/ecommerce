import { http } from '../lib/http/apiClient'
import type { Cart, CartItemInput, ShippingMethod } from '../types/api'

export const cartRepository = {
  get: (shippingMethod?: ShippingMethod) => http.get<Cart>('/cart', { shippingMethod }),
  clear: () => http.delete<void>('/cart'),
  addItem: (input: CartItemInput) => http.post<Cart>('/cart/items', input),
  updateItem: (id: string, quantity: number) => http.patch<Cart>(`/cart/items/${id}`, { quantity }),
  removeItem: (id: string) => http.delete<Cart>(`/cart/items/${id}`),
  /** Moves the guest (browser) cart into the account cart right after sign-in. */
  merge: (items: CartItemInput[]) => http.post<Cart & { skipped?: unknown[] }>('/cart/merge', { items }),
  applyCoupon: (code: string) => http.post<Cart>('/cart/coupon', { code }),
  removeCoupon: () => http.delete<Cart>('/cart/coupon'),
}
