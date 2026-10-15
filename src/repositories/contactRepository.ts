import { http } from '../lib/http/apiClient'

export const CONTACT_SUBJECTS = ['Product enquiry', 'Order support', 'Wholesale enquiry', 'Gifting and hampers', 'Something else'] as const

export type ContactInput = {
  fullName: string
  email: string
  phone: string
  /** BSC-XXXXXXXX */
  orderNumber?: string
  subject: (typeof CONTACT_SUBJECTS)[number]
  message: string
  consent: boolean
}

export const contactRepository = {
  send: (input: ContactInput) => http.post<unknown>('/contact', input, { auth: false }),
  subscribe: (email: string) => http.post<unknown>('/newsletter', { email }, { auth: false }),
}
