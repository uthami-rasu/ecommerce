import { api, run } from '../../app/api'
import { adminRepository } from '../../repositories/adminRepository'
import type {
  AdminCategoryListItem,
  AdminCategoryQuery,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderQuery,
  AdminProductListItem,
  AdminProductQuery,
  CategoryRef,
  CreateCategoryInput,
  CreateProductInput,
  Dashboard,
  OrderEventInput,
  Paginated,
  TrackingInput,
  UpdateCategoryInput,
  UpdateOrderStatusInput,
  UpdateProductInput,
  AdminProductDetail,
} from '../../types/api'

const orderTags = (id: string) => [{ type: 'AdminOrder' as const, id }, 'AdminOrders' as const, 'Dashboard' as const]

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<Dashboard, void>({
      queryFn: () => run(adminRepository.dashboard()),
      providesTags: ['Dashboard'],
    }),
    getAdminOrders: build.query<Paginated<AdminOrderListItem>, AdminOrderQuery>({
      queryFn: (query) => run(adminRepository.orders(query)),
      providesTags: ['AdminOrders'],
    }),
    getAdminOrder: build.query<AdminOrderDetail, string>({
      queryFn: (id) => run(adminRepository.order(id)),
      providesTags: (_result, _error, id) => [{ type: 'AdminOrder', id }],
    }),
    updateOrderStatus: build.mutation<AdminOrderDetail, { id: string } & UpdateOrderStatusInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.updateStatus(id, input)),
      invalidatesTags: (_result, _error, { id }) => orderTags(id),
    }),
    updateOrderTracking: build.mutation<AdminOrderDetail, { id: string } & TrackingInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.updateTracking(id, input)),
      invalidatesTags: (_result, _error, { id }) => orderTags(id),
    }),
    addOrderEvent: build.mutation<AdminOrderDetail, { id: string } & OrderEventInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.addEvent(id, input)),
      invalidatesTags: (_result, _error, { id }) => orderTags(id),
    }),
    getAdminProducts: build.query<Paginated<AdminProductListItem>, AdminProductQuery>({
      queryFn: (query) => run(adminRepository.products(query)),
      providesTags: ['AdminProducts'],
    }),
    getAdminProduct: build.query<AdminProductDetail, string>({
      queryFn: (id) => run(adminRepository.product(id)),
      providesTags: (_result, _error, id) => [{ type: 'AdminProducts', id }],
    }),
    updateAdminProduct: build.mutation<AdminProductDetail, { id: string } & UpdateProductInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.updateProduct(id, input)),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'AdminProducts', id }, 'AdminProducts', 'Products', 'Dashboard'],
    }),
    deleteAdminProduct: build.mutation<void, string>({
      queryFn: (id) => run(adminRepository.deleteProduct(id)),
      invalidatesTags: ['AdminProducts', 'Dashboard'],
    }),
    getAdminCategories: build.query<CategoryRef[], void>({
      queryFn: async () => {
        const result = await run(adminRepository.categories())
        if ('error' in result) return result
        const cats = (result.data as any)
        const flat: CategoryRef[] = []
        const collect = (arr: any[]) => arr?.forEach((c: any) => { flat.push({ id: c.id, name: c.name, slug: c.slug }); collect(c.children) })
        collect(Array.isArray(cats) ? cats : cats?.data ?? [])
        return { data: flat }
      },
      providesTags: ['Categories'],
    }),
    getAdminCategoriesList: build.query<Paginated<AdminCategoryListItem>, AdminCategoryQuery>({
      queryFn: (query) => run(adminRepository.adminCategories(query)),
      providesTags: ['AdminCategories'],
    }),
    getAdminCategory: build.query<AdminCategoryListItem, string>({
      queryFn: (id) => run(adminRepository.adminCategory(id)),
      providesTags: ['AdminCategories'],
    }),
    createAdminCategory: build.mutation<AdminCategoryListItem, CreateCategoryInput>({
      queryFn: (input) => run(adminRepository.createCategory(input)),
      invalidatesTags: ['AdminCategories', 'Categories', 'Dashboard'],
    }),
    updateAdminCategory: build.mutation<AdminCategoryListItem, { id: string } & UpdateCategoryInput>({
      queryFn: ({ id, ...input }) => run(adminRepository.updateCategory(id, input)),
      invalidatesTags: ['AdminCategories', 'Categories'],
    }),
    deleteAdminCategory: build.mutation<void, string>({
      queryFn: (id) => run(adminRepository.deleteCategory(id)),
      invalidatesTags: ['AdminCategories', 'Categories', 'Dashboard'],
    }),
    uploadCategoryImage: build.mutation<AdminCategoryListItem, { id: string; formData: FormData }>({
      queryFn: ({ id, formData }) => run(adminRepository.uploadCategoryImage(id, formData)),
      invalidatesTags: ['AdminCategories', 'Categories'],
    }),
    createAdminProduct: build.mutation<any, CreateProductInput>({
      queryFn: (input) => run(adminRepository.createProduct(input)),
      invalidatesTags: ['AdminProducts', 'Products', 'Categories', 'Dashboard'],
    }),
    uploadProductImage: build.mutation<any, { id: string; formData: FormData }>({
      queryFn: ({ id, formData }) => run(adminRepository.uploadProductImage(id, formData)),
      invalidatesTags: ['AdminProducts', 'Products'],
    }),
    getSettings: build.query<any, void>({
      queryFn: () => run(adminRepository.settings()),
      providesTags: ['Settings'],
    }),
    updateSettings: build.mutation<any, any>({
      queryFn: (input) => run(adminRepository.updateSettings(input)),
      invalidatesTags: ['Settings'],
    }),
    uploadStoreLogo: build.mutation<any, FormData>({
      queryFn: (formData) => run(adminRepository.uploadStoreLogo(formData)),
      invalidatesTags: ['Settings'],
    }),
    uploadFavicon: build.mutation<any, FormData>({
      queryFn: (formData) => run(adminRepository.uploadFavicon(formData)),
      invalidatesTags: ['Settings'],
    }),
    sendTestEmail: build.mutation<{ success: boolean; message: string }, string>({
      queryFn: (to) => run(adminRepository.testEmail(to)),
    }),
    getAdminCustomerStats: build.query<{ total: number; newThisMonth: number; active: number; inactive: number; withOrders: number }, void>({
      queryFn: () => run(adminRepository.customerStats()),
      providesTags: ['Customers'],
    }),
    getAdminCustomers: build.query<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }, { search?: string; status?: string; page?: number; limit?: number }>({
      queryFn: (query) => run(adminRepository.customers(query)),
      providesTags: ['Customers'],
    }),
    getAdminCustomer: build.query<any, string>({
      queryFn: (id) => run(adminRepository.customer(id)),
      providesTags: ['Customers'],
    }),
    updateCustomerStatus: build.mutation<{ success: boolean; isActive: boolean }, { id: string; isActive: boolean }>({
      queryFn: ({ id, isActive }) => run(adminRepository.updateCustomerStatus(id, isActive)),
      invalidatesTags: ['Customers'],
    }),
  }),
})

export const {
  useGetDashboardQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
  useAddOrderEventMutation,
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useGetAdminCategoriesQuery,
  useGetAdminCategoriesListQuery,
  useGetAdminCategoryQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useUploadCategoryImageMutation,
  useCreateAdminProductMutation,
  useUploadProductImageMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUploadStoreLogoMutation,
  useUploadFaviconMutation,
  useSendTestEmailMutation,
  useGetAdminCustomersQuery,
  useGetAdminCustomerStatsQuery,
  useGetAdminCustomerQuery,
  useUpdateCustomerStatusMutation,
} = adminApi
