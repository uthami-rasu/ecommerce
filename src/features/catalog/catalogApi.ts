import { api, run } from '../../app/api'
import { catalogRepository } from '../../repositories/catalogRepository'
import type { Category, PageQuery, Paginated, ProductDetail, ProductQuery, ProductSuggestion, ProductSummary, Review, ReviewInput, ReviewPage } from '../../types/api'

export type { ProductSuggestion } from '../../types/api'

export const catalogApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], void>({
      queryFn: () => run(catalogRepository.categories()),
      providesTags: ['Categories'],
      keepUnusedDataFor: 600,
    }),
    getProducts: build.query<Paginated<ProductSummary>, ProductQuery>({
      queryFn: (query) => run(catalogRepository.products(query)),
      providesTags: ['Products'],
    }),
    getProduct: build.query<ProductDetail, string>({
      queryFn: (slug) => run(catalogRepository.product(slug)),
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),
    searchSuggestions: build.query<ProductSuggestion[], { q: string; limit?: number }>({
      queryFn: ({ q, limit }) => run(catalogRepository.suggest(q, limit)),
      keepUnusedDataFor: 120,
    }),
    getReviews: build.query<ReviewPage, { slug: string } & PageQuery>({
      queryFn: ({ slug, ...query }) => run(catalogRepository.reviews(slug, query)),
      providesTags: (_result, _error, { slug }) => [{ type: 'Reviews', id: slug }],
    }),
    createReview: build.mutation<Review, { slug: string } & ReviewInput>({
      queryFn: ({ slug, ...input }) => run(catalogRepository.createReview(slug, input)),
      // Ratings are denormalised onto the product, so refresh both.
      invalidatesTags: (_result, _error, { slug }) => [{ type: 'Reviews', id: slug }, { type: 'Product', id: slug }, 'Products'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useSearchSuggestionsQuery,
  useGetReviewsQuery,
  useCreateReviewMutation,
} = catalogApi
