import { api, run } from '../../app/api'
import { adminGiftingRepository, giftingRepository } from '../../repositories/giftingRepository'
import type {
  AdminGiftOccasion,
  AdminGiftProduct,
  AdminGiftProductQuery,
  GiftEnquiry,
  GiftEnquiryInput,
  GiftImageSlot,
  GiftOccasionInput,
  GiftPageContent,
  GiftPageContentInput,
  GiftPageView,
  PageQuery,
  Paginated,
} from '../../types/api'

/** Everything the storefront shows changes when these change. */
const storefront = ['GiftPage', 'Products'] as const

export const giftingApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── Storefront ──
    getGiftPage: build.query<GiftPageView, void>({
      queryFn: () => run(giftingRepository.page()),
      providesTags: ['GiftPage'],
    }),
    createGiftEnquiry: build.mutation<{ received: true; reference: string }, GiftEnquiryInput>({
      queryFn: (input) => run(giftingRepository.createEnquiry(input)),
      invalidatesTags: ['GiftEnquiries'],
    }),

    // ── Admin: page content ──
    getAdminGiftContent: build.query<GiftPageContent, void>({
      queryFn: () => run(adminGiftingRepository.content()),
      providesTags: ['GiftPage'],
    }),
    updateAdminGiftContent: build.mutation<GiftPageContent, GiftPageContentInput>({
      queryFn: (input) => run(adminGiftingRepository.updateContent(input)),
      invalidatesTags: [...storefront],
    }),
    uploadGiftImage: build.mutation<GiftPageContent, { slot: GiftImageSlot; formData: FormData }>({
      queryFn: ({ slot, formData }) => run(adminGiftingRepository.uploadImage(slot, formData)),
      invalidatesTags: ['GiftPage'],
    }),
    removeGiftImage: build.mutation<GiftPageContent, GiftImageSlot>({
      queryFn: (slot) => run(adminGiftingRepository.removeImage(slot)),
      invalidatesTags: ['GiftPage'],
    }),

    // ── Admin: occasions ──
    getAdminGiftOccasions: build.query<AdminGiftOccasion[], void>({
      queryFn: () => run(adminGiftingRepository.occasions()),
      providesTags: ['GiftOccasions'],
    }),
    createGiftOccasion: build.mutation<AdminGiftOccasion, GiftOccasionInput>({
      queryFn: (input) => run(adminGiftingRepository.createOccasion(input)),
      invalidatesTags: ['GiftOccasions', ...storefront],
    }),
    updateGiftOccasion: build.mutation<AdminGiftOccasion, { id: string } & Partial<GiftOccasionInput>>({
      queryFn: ({ id, ...input }) => run(adminGiftingRepository.updateOccasion(id, input)),
      invalidatesTags: ['GiftOccasions', ...storefront],
    }),
    deleteGiftOccasion: build.mutation<void, string>({
      queryFn: (id) => run(adminGiftingRepository.deleteOccasion(id)),
      invalidatesTags: ['GiftOccasions', 'GiftProducts', ...storefront],
    }),
    uploadGiftOccasionImage: build.mutation<AdminGiftOccasion, { id: string; formData: FormData }>({
      queryFn: ({ id, formData }) => run(adminGiftingRepository.uploadOccasionImage(id, formData)),
      invalidatesTags: ['GiftOccasions', 'GiftPage'],
    }),

    // ── Admin: products ──
    getAdminGiftProducts: build.query<Paginated<AdminGiftProduct>, AdminGiftProductQuery>({
      queryFn: (query) => run(adminGiftingRepository.products(query)),
      providesTags: ['GiftProducts'],
    }),
    setGiftProductOccasions: build.mutation<{ productId: string; occasionIds: string[] }, { productId: string; occasionIds: string[] }>({
      queryFn: ({ productId, occasionIds }) => run(adminGiftingRepository.setProductOccasions(productId, occasionIds)),
      invalidatesTags: ['GiftProducts', 'GiftOccasions', ...storefront],
    }),

    // ── Admin: enquiries ──
    getGiftEnquiries: build.query<Paginated<GiftEnquiry>, PageQuery & { resolved?: boolean }>({
      queryFn: (query) => run(adminGiftingRepository.enquiries(query)),
      providesTags: ['GiftEnquiries'],
    }),
    updateGiftEnquiry: build.mutation<GiftEnquiry, { id: string; isResolved: boolean }>({
      queryFn: ({ id, isResolved }) => run(adminGiftingRepository.updateEnquiry(id, isResolved)),
      invalidatesTags: ['GiftEnquiries'],
    }),
  }),
})

export const {
  useGetGiftPageQuery,
  useCreateGiftEnquiryMutation,
  useGetAdminGiftContentQuery,
  useUpdateAdminGiftContentMutation,
  useUploadGiftImageMutation,
  useRemoveGiftImageMutation,
  useGetAdminGiftOccasionsQuery,
  useCreateGiftOccasionMutation,
  useUpdateGiftOccasionMutation,
  useDeleteGiftOccasionMutation,
  useUploadGiftOccasionImageMutation,
  useGetAdminGiftProductsQuery,
  useSetGiftProductOccasionsMutation,
  useGetGiftEnquiriesQuery,
  useUpdateGiftEnquiryMutation,
} = giftingApi
