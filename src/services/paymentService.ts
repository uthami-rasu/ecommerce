import { ApiError } from '../lib/http/apiClient'
import { paymentsRepository } from '../repositories/ordersRepository'
import type { MockOutcome, Order, Payment, RazorpayCheckoutConfig } from '../types/api'
import { fullName } from '../utils/format'
import { openRazorpayCheckout } from './razorpayCheckout'

/**
 * Runs the three gateway steps for an order. With the mock provider the "widget"
 * step is an API call; with Razorpay it is the Razorpay checkout popup.
 */
export async function payOrder(orderNumber: string, outcome: MockOutcome): Promise<Payment> {
  const payment = await paymentsRepository.initiate(orderNumber)
  const widget = await paymentsRepository.mockCheckout(payment.id, outcome)
  return paymentsRepository.confirm(payment.id, widget.providerPaymentId, widget.signature)
}

/**
 * Creates a Razorpay order on the API (which fixes the amount server-side), opens
 * Checkout, then has the API verify the result. `onAuthorized` fires once Razorpay
 * reports success and server verification starts.
 */
export async function payWithRazorpay(order: Order, onAuthorized: () => void): Promise<Payment> {
  const payment = await paymentsRepository.initiate(order.orderNumber)
  const checkout = payment.checkout as RazorpayCheckoutConfig
  if (checkout.provider !== 'razorpay') throw new ApiError({ status: 0, message: 'Payments are not configured for Razorpay.' })

  const address = order.billingAddress ?? order.shippingAddress
  const result = await openRazorpayCheckout({
    keyId: checkout.keyId,
    providerOrderId: checkout.providerOrderId,
    amount: checkout.amount,
    currency: checkout.currency,
    description: `Order ${order.orderNumber}`,
    // Razorpay only recognises the number without spaces, e.g. +919876543210.
    prefill: { name: fullName(address), email: order.contactEmail, contact: address.phone.replace(/[^\d+]/g, '') },
  })
  if (result.razorpay_order_id !== checkout.providerOrderId) {
    throw new ApiError({ status: 0, message: 'The payment response did not match this order. Please contact support with your order number.' })
  }
  onAuthorized()
  return paymentsRepository.confirm(payment.id, result.razorpay_payment_id, result.razorpay_signature)
}
