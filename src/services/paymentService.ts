import { paymentsRepository } from '../repositories/ordersRepository'
import type { MockOutcome, Payment } from '../types/api'

/**
 * Runs the three gateway steps for an order. With the mock provider the "widget"
 * step is an API call; with Razorpay it would be the Razorpay checkout popup.
 */
export async function payOrder(orderNumber: string, outcome: MockOutcome): Promise<Payment> {
  const payment = await paymentsRepository.initiate(orderNumber)
  const widget = await paymentsRepository.mockCheckout(payment.id, outcome)
  return paymentsRepository.confirm(payment.id, widget.providerPaymentId, widget.signature)
}
