import { baseApi } from './baseApi';
import { SERVER_URL } from '../configs/serverConfig';

export interface Warranty {
  id: string;
  orderId: string;
  sparePartId?: string;
  type: 'work' | 'spare_part' | 'complex';
  description?: string;
  durationMonths: number;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'claimed' | 'voided';
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  userId: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export const warrantyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveWarranties: builder.query<Warranty[], void>({
      query: () => '/warranty/active',
      providesTags: ['Warranty'],
    }),
    getWarrantiesByOrder: builder.query<Warranty[], string>({
      query: (orderId) => `/warranty/order/${orderId}`,
      providesTags: ['Warranty'],
    }),
    getWarranty: builder.query<Warranty, string>({
      query: (id) => `/warranty/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Warranty', id }],
    }),
    createWarranty: builder.mutation<Warranty, Partial<Warranty> & { durationMonths: number; orderId: string }>({
      query: (body) => ({ url: '/warranty', method: 'POST', body }),
      invalidatesTags: ['Warranty'],
    }),
    updateWarrantyStatus: builder.mutation<Warranty, { id: string; status: Warranty['status'] }>({
      query: ({ id, status }) => ({ url: `/warranty/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Warranty'],
    }),
    getMyClaims: builder.query<WarrantyClaim[], void>({
      query: () => '/warranty/claims/my',
      providesTags: ['Warranty'],
    }),
    getAllClaims: builder.query<WarrantyClaim[], string | void>({
      query: (warrantyId) => warrantyId ? `/warranty/claims?warrantyId=${warrantyId}` : '/warranty/claims',
      providesTags: ['Warranty'],
    }),
    createClaim: builder.mutation<WarrantyClaim, { warrantyId: string; description: string }>({
      query: (body) => ({ url: '/warranty/claims', method: 'POST', body }),
      invalidatesTags: ['Warranty'],
    }),
    updateClaimStatus: builder.mutation<WarrantyClaim, { id: string; status: WarrantyClaim['status']; resolution?: string }>({
      query: ({ id, ...body }) => ({ url: `/warranty/claims/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Warranty'],
    }),
  }),
});

export const getCertificateUrl = (warrantyId: string) =>
  `${SERVER_URL}/warranty/${warrantyId}/certificate`;

export const {
  useGetActiveWarrantiesQuery,
  useGetWarrantiesByOrderQuery,
  useGetWarrantyQuery,
  useCreateWarrantyMutation,
  useUpdateWarrantyStatusMutation,
  useGetMyClaimsQuery,
  useGetAllClaimsQuery,
  useCreateClaimMutation,
  useUpdateClaimStatusMutation,
} = warrantyApi;
