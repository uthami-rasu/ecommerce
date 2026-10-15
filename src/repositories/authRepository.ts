import { http } from '../lib/http/apiClient'
import type { AuthResponse, LoginInput, OtpChallenge, OtpPurpose, RegisterInput, ResetPasswordInput, UserProfile } from '../types/api'

export const authRepository = {
  register: (input: RegisterInput) => http.post<OtpChallenge>('/auth/register', input, { auth: false }),
  verifyEmail: (email: string, code: string) => http.post<AuthResponse>('/auth/verify-email', { email, code }, { auth: false }),
  resendOtp: (email: string, purpose: Exclude<OtpPurpose, 'change_email'>) =>
    http.post<OtpChallenge>('/auth/resend-otp', { email, purpose }, { auth: false }),
  login: (input: LoginInput) => http.post<AuthResponse>('/auth/login', input, { auth: false }),
  forgotPassword: (email: string) => http.post<OtpChallenge>('/auth/forgot-password', { email }, { auth: false }),
  resetPassword: (input: ResetPasswordInput) => http.post<AuthResponse>('/auth/reset-password', input, { auth: false }),
  logout: (refreshToken: string) => http.post<void>('/auth/logout', { refreshToken }, { auth: false }),
  me: () => http.get<UserProfile>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.post<AuthResponse>('/auth/change-password', { currentPassword, newPassword }),
}
