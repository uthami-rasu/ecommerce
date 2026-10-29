import { ApiError } from '../lib/http/apiClient'

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

/** Error code for a checkout the customer closed without paying (not a failure to report loudly). */
export const CHECKOUT_DISMISSED = 'CHECKOUT_DISMISSED'

export type RazorpaySuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayFailure = { error?: { description?: string } }

type RazorpayInstance = {
  open(): void
  on(event: 'payment.failed', handler: (response: RazorpayFailure) => void): void
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance
  }
}

let loading: Promise<void> | null = null

/** Loads Razorpay's checkout.js on first use only, so other pages never pull in third-party script. */
function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      loading = null
      reject(new ApiError({ status: 0, message: 'Could not load the payment window. Check your connection and try again.' }))
    }
    document.head.appendChild(script)
  })
  return loading
}

export type RazorpayCheckoutOptions = {
  keyId: string
  providerOrderId: string
  amount: number
  currency: string
  description: string
  prefill: { name?: string; email?: string; contact?: string }
  /** Payment methods to offer; omitted = Razorpay's defaults. */
  methods?: { upi: boolean; card: boolean; netbanking: boolean }
}

/**
 * Opens Razorpay Checkout and resolves with what it returns on success. The result is
 * not proof of payment: the API verifies the signature and re-reads the payment from Razorpay.
 * Failed attempts keep the window open so the customer can retry; closing it rejects.
 */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<RazorpaySuccess> {
  await loadCheckout()
  const Razorpay = window.Razorpay
  if (!Razorpay) throw new ApiError({ status: 0, message: 'Could not load the payment window. Please try again.' })

  return new Promise((resolve, reject) => {
    let lastFailure: string | undefined
    const checkout = new Razorpay({
      key: options.keyId,
      order_id: options.providerOrderId,
      amount: options.amount,
      currency: options.currency,
      name: 'Bossco Naturals',
      description: options.description,
      prefill: options.prefill,
      ...(options.methods && { method: options.methods }),
      theme: { color: '#173f32' },
      handler: (response: RazorpaySuccess) => resolve(response),
      modal: {
        confirm_close: true,
        ondismiss: () =>
          reject(new ApiError({ status: 0, code: CHECKOUT_DISMISSED, message: lastFailure ?? 'Payment was cancelled before it completed.' })),
      },
    })
    checkout.on('payment.failed', (response) => {
      lastFailure = response.error?.description || 'The payment did not go through.'
    })
    checkout.open()
  })
}
