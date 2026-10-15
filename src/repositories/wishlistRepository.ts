import { http } from '../lib/http/apiClient'
import type { ProductSummary } from '../types/api'

export const wishlistRepository = {
  list: () => http.get<ProductSummary[]>('/wishlist'),
  add: (productId: string) => http.put<{ productId: string; saved: true }>(`/wishlist/${productId}`),
  remove: (productId: string) => http.delete<void>(`/wishlist/${productId}`),
}
