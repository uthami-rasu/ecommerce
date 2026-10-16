import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { toApiError, type ApiErrorShape } from '../lib/http/apiClient'

/**
 * Single RTK Query cache for server state. Endpoints call repositories (the only
 * layer that knows URLs) and are injected per feature in `features/<name>/<name>Api.ts`.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiErrorShape>(),
  tagTypes: ['Cart', 'Wishlist', 'Profile', 'Addresses', 'Orders', 'Order', 'Reviews', 'Product', 'Products', 'Categories', 'AdminOrders', 'AdminOrder', 'Dashboard', 'AdminProducts', 'AdminCategories', 'Settings', 'Customers'],
  // Server data is cheap to refetch; keep unused results for a minute.
  keepUnusedDataFor: 60,
  refetchOnFocus: false,
  endpoints: () => ({}),
})

/** Adapts a repository promise to the `{ data } | { error }` shape RTK Query expects. */
export async function run<T>(promise: Promise<T>): Promise<{ data: T } | { error: ApiErrorShape }> {
  try {
    return { data: await promise }
  } catch (error) {
    return { error: toApiError(error) }
  }
}
