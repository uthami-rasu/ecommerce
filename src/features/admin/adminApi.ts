import { api, run } from '../../app/api'
import { adminRepository } from '../../repositories/adminRepository'
import type {
  AdminOrderDetail, AdminOrderListItem, AdminOrderQuery, Dashboard, OrderEventInput, Paginated, TrackingInput, UpdateOrderStatusInput,
} from '../../types/api'

const orderTags = (id: string) => [{ type: 'AdminOrder' as const, id }, 'AdminOrders' as const, 'Dashboard' as const]

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<Dashboard, void>({
      queryFn: () => run(adminRepository.dashboard()),
      providesTags: ['Dashboard'],
    }),
    getAdminOrders: build.query<Paginated<AdminOrderListItem>, AdminOrderQuery>({
      queryFn: (query) => run(adminRepository.orders(query)),
      providesTags: ['AdminOrders'],
    }),
    getAdminOrder: build.query<AdminOrderDetail, string>({
      queryFn: (id) => run(adminRepository.order(id)),
      providesTags: (_result, _error, id) => [{ type: 'AdminOrder', id }],
    }),
    updateOrderStatus: build.mutation<AdminOrderDetail, { id: string } & UpdateOrderStatusInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.updateStatus(id, input)),
      invalidatesTags: (_result, _error, { id }) => orderTags(id),
    }),
    updateOrderTracking: build.mutation<AdminOrderDetail, { id: string } & TrackingInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.updateTracking(id, input)),
      invalidatesTags: (_result, _error, { id }) => orderTags(id),
    }),
    addOrderEvent: build.mutation<AdminOrderDetail, { id: string } & OrderEventInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.addEvent(id, input)),
      invalidatesTags: (_result, _error, { id }) => orderTags(id),
    }),
  }),
})

export const {
  useGetDashboardQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
  useAddOrderEventMutation,
} = adminApi
