import { api, run } from '../../app/api'
import { ordersRepository, paymentsRepository } from '../../repositories/ordersRepository'
import type { CheckoutInput, Order, PageQuery, Paginated, PaymentGateway } from '../../types/api'

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
    getPaymentGateway: build.query<PaymentGateway, void>({
      queryFn: () => run(paymentsRepository.gateway()),
      keepUnusedDataFor: 3600,
    }),
  }),
})

export const { useGetOrdersQuery, useGetOrderQuery, usePlaceOrderMutation, useCancelOrderMutation, useGetPaymentGatewayQuery } = ordersApi
