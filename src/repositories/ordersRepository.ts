import { http } from '../lib/http/apiClient'
import type { CheckoutInput, MockCheckoutResult, MockOutcome, Order, PageQuery, Paginated, Payment, PaymentInitiation } from '../types/api'

const orderPath = (orderNumber: string) => `/orders/${encodeURIComponent(orderNumber)}`

export const ordersRepository = {
  place: (input: CheckoutInput) => http.post<Order>('/orders', input),
  list: (query: PageQuery = {}) => http.get<Paginated<Order>>('/orders', query),
  get: (orderNumber: string) => http.get<Order>(orderPath(orderNumber)),
  cancel: (orderNumber: string) => http.post<Order>(`${orderPath(orderNumber)}/cancel`),
}

/** Gateway-agnostic payment steps; the mock provider stands in for Razorpay. */
export const paymentsRepository = {
  initiate: (orderNumber: string) => http.post<PaymentInitiation>(`/payments/orders/${encodeURIComponent(orderNumber)}`),
  mockCheckout: (paymentId: string, outcome: MockOutcome) =>
    http.post<MockCheckoutResult>(`/payments/${paymentId}/mock-checkout`, { outcome }),
  confirm: (paymentId: string, providerPaymentId: string, signature: string) =>
    http.post<Payment>(`/payments/${paymentId}/confirm`, { providerPaymentId, signature }),
  get: (paymentId: string) => http.get<Payment>(`/payments/${paymentId}`),
}
