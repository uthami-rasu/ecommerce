import { api, run } from '../../app/api'
import { ordersRepository } from '../../repositories/ordersRepository'
import type { CheckoutInput, Order, PageQuery, Paginated } from '../../types/api'

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Paginated<Order>, PageQuery>({
      queryFn: (query) => run(ordersRepository.list(query)),
      providesTags: ['Orders'],
    }),
    getOrder: build.query<Order, string>({
      queryFn: (orderNumber) => run(ordersRepository.get(orderNumber)),
      providesTags: (_result, _error, orderNumber) => [{ type: 'Order', id: orderNumber }],
    }),
    placeOrder: build.mutation<Order, CheckoutInput>({
      queryFn: (input) => run(ordersRepository.place(input)),
      // Checkout empties the cart server-side.
      invalidatesTags: ['Orders', 'Cart'],
    }),
    cancelOrder: build.mutation<Order, string>({
      queryFn: (orderNumber) => run(ordersRepository.cancel(orderNumber)),
      invalidatesTags: (_result, _error, orderNumber) => ['Orders', { type: 'Order', id: orderNumber }],
    }),
  }),
})

export const { useGetOrdersQuery, useGetOrderQuery, usePlaceOrderMutation, useCancelOrderMutation } = ordersApi
