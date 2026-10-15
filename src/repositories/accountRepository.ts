import { http } from '../lib/http/apiClient'
import type { Address, AddressInput, OtpChallenge, UpdateProfileInput, UserProfile } from '../types/api'

export const accountRepository = {
  profile: () => http.get<UserProfile>('/users/me'),
  updateProfile: (input: UpdateProfileInput) => http.patch<UserProfile>('/users/me', input),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('image', file)
    return http.post<UserProfile>('/users/me/avatar', form)
  },
  requestEmailChange: (newEmail: string, password: string) =>
    http.post<OtpChallenge>('/users/me/email-change', { newEmail, password }),
  confirmEmailChange: (code: string) => http.post<UserProfile>('/users/me/email-change/confirm', { code }),

  addresses: () => http.get<Address[]>('/users/me/addresses'),
  createAddress: (input: AddressInput) => http.post<Address>('/users/me/addresses', input),
  updateAddress: (id: string, input: Partial<AddressInput>) => http.patch<Address>(`/users/me/addresses/${id}`, input),
  deleteAddress: (id: string) => http.delete<void>(`/users/me/addresses/${id}`),
}
