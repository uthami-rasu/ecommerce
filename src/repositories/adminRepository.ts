import { http } from '../lib/http/apiClient'
import type {
  AdminCategoryListItem,
  AdminCategoryQuery,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderQuery,
  AdminProductListItem,
  AdminProductQuery,
  CategoryRef,
  CreateCategoryInput,
  CreateProductInput,
  Dashboard,
  OrderEventInput,
  Paginated,
  TrackingInput,
  UpdateCategoryInput,
  UpdateOrderStatusInput,
} from '../types/api'

export const adminRepository = {
  dashboard: () => http.get<Dashboard>('/admin/dashboard'),
  orders: (query: AdminOrderQuery = {}) => http.get<Paginated<AdminOrderListItem>>('/admin/orders', query),
  order: (id: string) => http.get<AdminOrderDetail>(`/admin/orders/${id}`),
  updateStatus: (id: string, input: UpdateOrderStatusInput) => http.patch<AdminOrderDetail>(`/admin/orders/${id}/status`, input),
  updateTracking: (id: string, input: TrackingInput) => http.patch<AdminOrderDetail>(`/admin/orders/${id}/tracking`, input),
  addEvent: (id: string, input: OrderEventInput) => http.post<AdminOrderDetail>(`/admin/orders/${id}/events`, input),
  products: (query: AdminProductQuery = {}) => http.get<Paginated<AdminProductListItem>>('/admin/products', query),
  deleteProduct: (id: string) => http.delete<void>(`/admin/products/${id}`),
  createProduct: (input: CreateProductInput) => http.post<any>('/admin/products', input),
  uploadProductImage: (id: string, formData: FormData) => http.post<any>(`/admin/products/${id}/images`, formData),
  categories: () => http.get<{ data: CategoryRef[] }>('/categories'),
  adminCategories: (query: AdminCategoryQuery = {}) => http.get<Paginated<AdminCategoryListItem>>('/admin/categories', query),
  adminCategory: (id: string) => http.get<AdminCategoryListItem>(`/admin/categories/${id}`),
  createCategory: (input: CreateCategoryInput) => http.post<AdminCategoryListItem>('/admin/categories', input),
  updateCategory: (id: string, input: UpdateCategoryInput) => http.patch<AdminCategoryListItem>(`/admin/categories/${id}`, input),
  deleteCategory: (id: string) => http.delete<void>(`/admin/categories/${id}`),
  uploadCategoryImage: (id: string, formData: FormData) => http.post<AdminCategoryListItem>(`/admin/categories/${id}/image`, formData),
  settings: () => http.get<any>('/admin/settings'),
  updateSettings: (input: any) => http.patch<any>('/admin/settings', input),
  testEmail: (to: string) => http.post<{ success: boolean; message: string }>('/admin/settings/test-email', { to }),
  customers: (query: { search?: string; status?: string; page?: number; limit?: number } = {}) =>
    http.get<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>('/admin/customers', query),
  customer: (id: string) => http.get<any>(`/admin/customers/${id}`),
  updateCustomerStatus: (id: string, isActive: boolean) =>
    http.patch<{ success: boolean; isActive: boolean }>(`/admin/customers/${id}/status`, { isActive }),
}

