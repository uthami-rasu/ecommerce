import { http } from '../lib/http/apiClient'
import type {
  AdminOrderDetail, AdminOrderListItem, AdminOrderQuery, Dashboard, OrderEventInput, Paginated, TrackingInput, UpdateOrderStatusInput,
} from '../types/api'

export const adminRepository = {
  dashboard: () => http.get<Dashboard>('/admin/dashboard'),
  orders: (query: AdminOrderQuery = {}) => http.get<Paginated<AdminOrderListItem>>('/admin/orders', query),
  order: (id: string) => http.get<AdminOrderDetail>(`/admin/orders/${id}`),
  updateStatus: (id: string, input: UpdateOrderStatusInput) => http.patch<AdminOrderDetail>(`/admin/orders/${id}/status`, input),
  updateTracking: (id: string, input: TrackingInput) => http.patch<AdminOrderDetail>(`/admin/orders/${id}/tracking`, input),
  addEvent: (id: string, input: OrderEventInput) => http.post<AdminOrderDetail>(`/admin/orders/${id}/events`, input),
}
