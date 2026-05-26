import { baseApi } from './baseApi';

export interface Branch {
  id: string;
  name: string;
  address: string;
  city?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  workingHours?: string;
  isActive: boolean;
}

export interface ProductionPost {
  id: string;
  branchId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoreTransfer {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  sparePartId: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export const branchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<Branch[], void>({
      query: () => '/branches',
      providesTags: ['Branch'],
    }),
    getBranch: builder.query<Branch, string>({
      query: (id) => `/branches/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Branch', id }],
    }),
    createBranch: builder.mutation<Branch, Omit<Branch, 'id' | 'isActive'>>({
      query: (body) => ({ url: '/branches', method: 'POST', body }),
      invalidatesTags: ['Branch'],
    }),
    updateBranch: builder.mutation<Branch, { id: string; data: Partial<Branch> }>({
      query: ({ id, data }) => ({ url: `/branches/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Branch'],
    }),
    getBranchEmployees: builder.query<{ branchId: string; employeeId: string; isPrimary: boolean }[], string>({
      query: (branchId) => `/branches/${branchId}/employees`,
      providesTags: ['Branch'],
    }),
    assignEmployee: builder.mutation<void, { branchId: string; employeeId: string; isPrimary?: boolean }>({
      query: ({ branchId, ...body }) => ({ url: `/branches/${branchId}/employees`, method: 'POST', body }),
      invalidatesTags: ['Branch'],
    }),
    getTransfers: builder.query<StoreTransfer[], string | void>({
      query: (fromStoreId) => fromStoreId ? `/branches/transfers?fromStoreId=${fromStoreId}` : '/branches/transfers',
      providesTags: ['Branch'],
    }),
    createTransfer: builder.mutation<StoreTransfer, Omit<StoreTransfer, 'id' | 'status' | 'createdAt'>>({
      query: (body) => ({ url: '/branches/transfers', method: 'POST', body }),
      invalidatesTags: ['Branch'],
    }),
    updateTransferStatus: builder.mutation<StoreTransfer, { id: string; status: StoreTransfer['status'] }>({
      query: ({ id, status }) => ({ url: `/branches/transfers/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Branch'],
    }),
    getPosts: builder.query<ProductionPost[], string>({
      query: (branchId) => `/branches/${branchId}/posts`,
      providesTags: ['Branch'],
    }),
    createPost: builder.mutation<ProductionPost, { branchId: string; name: string }>({
      query: ({ branchId, name }) => ({ url: `/branches/${branchId}/posts`, method: 'POST', body: { name } }),
      invalidatesTags: ['Branch'],
    }),
    updatePost: builder.mutation<ProductionPost, { branchId: string; postId: string; data: Partial<ProductionPost> }>({
      query: ({ branchId, postId, data }) => ({ url: `/branches/${branchId}/posts/${postId}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Branch'],
    }),
    deletePost: builder.mutation<void, { branchId: string; postId: string }>({
      query: ({ branchId, postId }) => ({ url: `/branches/${branchId}/posts/${postId}`, method: 'DELETE' }),
      invalidatesTags: ['Branch'],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useGetBranchEmployeesQuery,
  useAssignEmployeeMutation,
  useGetTransfersQuery,
  useCreateTransferMutation,
  useUpdateTransferStatusMutation,
  useGetPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = branchesApi;
