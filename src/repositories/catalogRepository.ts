import { http } from '../lib/http/apiClient'
import type { Category, Paginated, PageQuery, ProductDetail, ProductQuery, ProductSuggestion, ProductSummary, ReviewInput, ReviewPage, Review } from '../types/api'

export const catalogRepository = {
  categories: () => http.get<Category[]>('/categories', undefined, { auth: false }),
  category: (slug: string) => http.get<Category>(`/categories/${encodeURIComponent(slug)}`, undefined, { auth: false }),
  products: (query: ProductQuery = {}) => http.get<Paginated<ProductSummary>>('/products', query, { auth: false }),
  product: (slug: string) => http.get<ProductDetail>(`/products/${encodeURIComponent(slug)}`, undefined, { auth: false }),
  suggest: (q: string, limit = 4) => http.get<ProductSuggestion[]>('/products/suggest', { q, limit }, { auth: false }),

  reviews: (slug: string, query: PageQuery = {}) =>
    http.get<ReviewPage>(`/products/${encodeURIComponent(slug)}/reviews`, query, { auth: false }),
  createReview: (slug: string, input: ReviewInput) => http.post<Review>(`/products/${encodeURIComponent(slug)}/reviews`, input),
}
