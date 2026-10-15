import { api, run } from '../../app/api'
import { accountRepository } from '../../repositories/accountRepository'
import { authRepository } from '../../repositories/authRepository'
import type { Address, AddressInput, AuthResponse, OtpChallenge, UpdateProfileInput, UserProfile } from '../../types/api'

export const accountApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<UserProfile, void>({
      queryFn: () => run(accountRepository.profile()),
      providesTags: ['Profile'],
    }),
    updateProfile: build.mutation<UserProfile, UpdateProfileInput>({
      queryFn: (input) => run(accountRepository.updateProfile(input)),
      invalidatesTags: ['Profile'],
    }),
    uploadAvatar: build.mutation<UserProfile, File>({
      queryFn: (file) => run(accountRepository.uploadAvatar(file)),
      invalidatesTags: ['Profile'],
    }),
    changePassword: build.mutation<AuthResponse, { currentPassword: string; newPassword: string }>({
      queryFn: ({ currentPassword, newPassword }) => run(authRepository.changePassword(currentPassword, newPassword)),
    }),
    requestEmailChange: build.mutation<OtpChallenge, { newEmail: string; password: string }>({
      queryFn: ({ newEmail, password }) => run(accountRepository.requestEmailChange(newEmail, password)),
    }),
    confirmEmailChange: build.mutation<UserProfile, string>({
      queryFn: (code) => run(accountRepository.confirmEmailChange(code)),
      invalidatesTags: ['Profile'],
    }),

    getAddresses: build.query<Address[], void>({
      queryFn: () => run(accountRepository.addresses()),
      providesTags: ['Addresses'],
    }),
    createAddress: build.mutation<Address, AddressInput>({
      queryFn: (input) => run(accountRepository.createAddress(input)),
      invalidatesTags: ['Addresses'],
    }),
    updateAddress: build.mutation<Address, { id: string } & Partial<AddressInput>>({
      queryFn: ({ id, ...input }) => run(accountRepository.updateAddress(id, input)),
      invalidatesTags: ['Addresses'],
    }),
    deleteAddress: build.mutation<void, string>({
      queryFn: (id) => run(accountRepository.deleteAddress(id)),
      invalidatesTags: ['Addresses'],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = accountApi
