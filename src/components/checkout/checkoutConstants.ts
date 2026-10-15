import type { ShippingMethod } from '../../types/api'

/** Standard shipping is free once the discounted subtotal reaches this (mirrors the API rule). */
export const FREE_SHIPPING_THRESHOLD = 999

export const SHIPPING_METHOD_HINT: Record<ShippingMethod, string> = {
  standard: 'Delivered in about 5 days',
  express: 'Delivered in about 2 days',
  pickup: 'Ready next day at our Kovilpatti store',
}

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const

const SHIPPING_KEY = 'bossco.shippingMethod'
const METHODS: ShippingMethod[] = ['standard', 'express', 'pickup']

/** The shopper's last shipping choice, so the cart's selection carries into checkout. */
export const loadShippingMethod = (): ShippingMethod => {
  try {
    const stored = sessionStorage.getItem(SHIPPING_KEY) as ShippingMethod | null
    return stored && METHODS.includes(stored) ? stored : 'standard'
  } catch {
    return 'standard'
  }
}

export const saveShippingMethod = (method: ShippingMethod) => {
  try {
    sessionStorage.setItem(SHIPPING_KEY, method)
  } catch {
    // Storage blocked (private mode): the choice just isn't remembered.
  }
}
