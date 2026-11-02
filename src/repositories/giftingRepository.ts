import { http } from '../lib/http/apiClient'
import type {
  AdminGiftOccasion,
  AdminGiftProduct,
  AdminGiftProductQuery,
  GiftDesign,
  GiftDesignInput,
  GiftDesignSlot,
  GiftEnquiry,
  GiftEnquiryInput,
  GiftImageSlot,
  GiftOccasionInput,
  GiftPageContent,
  GiftPageContentInput,
  GiftPageView,
  PageQuery,
  Paginated,
} from '../types/api'

export const giftingRepository = {
  page: () => http.get<GiftPageView>('/gifting', undefined, { auth: false }),
  createEnquiry: (input: GiftEnquiryInput) => http.post<{ received: true; reference: string }>('/gifting/enquiries', input, { auth: false }),
}

export const adminGiftingRepository = {
  design: () => http.get<GiftDesign>('/admin/gifting/design'),
  updateDesign: (input: GiftDesignInput) => http.put<GiftDesign>('/admin/gifting/design', input),
  uploadDesignImage: (slot: GiftDesignSlot, formData: FormData) => http.post<GiftDesign>(`/admin/gifting/design/images/${slot}`, formData),
  removeDesignImage: (slot: GiftDesignSlot) => http.delete<GiftDesign>(`/admin/gifting/design/images/${slot}`),
  content: () => http.get<GiftPageContent>('/admin/gifting/page'),
  updateContent: (input: GiftPageContentInput) => http.put<GiftPageContent>('/admin/gifting/page', input),
  uploadImage: (slot: GiftImageSlot, formData: FormData) => http.post<GiftPageContent>(`/admin/gifting/page/images/${slot}`, formData),
  removeImage: (slot: GiftImageSlot) => http.delete<GiftPageContent>(`/admin/gifting/page/images/${slot}`),
  occasions: () => http.get<AdminGiftOccasion[]>('/admin/gifting/occasions'),
  createOccasion: (input: GiftOccasionInput) => http.post<AdminGiftOccasion>('/admin/gifting/occasions', input),
  updateOccasion: (id: string, input: Partial<GiftOccasionInput>) => http.patch<AdminGiftOccasion>(`/admin/gifting/occasions/${id}`, input),
  deleteOccasion: (id: string) => http.delete<void>(`/admin/gifting/occasions/${id}`),
  uploadOccasionImage: (id: string, formData: FormData) => http.post<AdminGiftOccasion>(`/admin/gifting/occasions/${id}/image`, formData),
  products: (query: AdminGiftProductQuery) => http.get<Paginated<AdminGiftProduct>>('/admin/gifting/products', query),
  setProductOccasions: (productId: string, occasionIds: string[]) =>
    http.put<{ productId: string; occasionIds: string[] }>(`/admin/gifting/products/${productId}/occasions`, { occasionIds }),
  enquiries: (query: PageQuery & { resolved?: boolean }) => http.get<Paginated<GiftEnquiry>>('/admin/gifting/enquiries', query),
  updateEnquiry: (id: string, isResolved: boolean) => http.patch<GiftEnquiry>(`/admin/gifting/enquiries/${id}`, { isResolved }),
}
