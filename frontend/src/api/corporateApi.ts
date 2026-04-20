import { baseApi } from './baseApi';

export interface Company {
  id: string;
  name: string;
  inn?: string;
  address?: string;
  city?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  managerUserId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CompanyContract {
  id: string;
  companyId: string;
  contractNumber?: string;
  discountPercent?: string;
  creditLimit?: string;
  paymentTermDays?: string;
  status: 'draft' | 'active' | 'suspended' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: string;
}

export const corporateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query<Company[], void>({
      query: () => '/corporate/companies',
      providesTags: ['Corporate'],
    }),
    getCompany: builder.query<Company, string>({
      query: (id) => `/corporate/companies/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Corporate', id }],
    }),
    createCompany: builder.mutation<Company, Omit<Company, 'id' | 'isActive' | 'createdAt'>>({
      query: (body) => ({ url: '/corporate/companies', method: 'POST', body }),
      invalidatesTags: ['Corporate'],
    }),
    updateCompany: builder.mutation<Company, { id: string; data: Partial<Company> }>({
      query: ({ id, data }) => ({ url: `/corporate/companies/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Corporate'],
    }),
    getContracts: builder.query<CompanyContract[], string>({
      query: (companyId) => `/corporate/companies/${companyId}/contracts`,
      providesTags: ['Corporate'],
    }),
    createContract: builder.mutation<CompanyContract, Omit<CompanyContract, 'id' | 'status' | 'createdAt'>>({
      query: (body) => ({ url: '/corporate/contracts', method: 'POST', body }),
      invalidatesTags: ['Corporate'],
    }),
    updateContractStatus: builder.mutation<CompanyContract, { id: string; status: CompanyContract['status'] }>({
      query: ({ id, status }) => ({ url: `/corporate/contracts/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Corporate'],
    }),
    getCompanyCars: builder.query<{ companyId: string; carId: string; notes?: string }[], string>({
      query: (companyId) => `/corporate/companies/${companyId}/cars`,
      providesTags: ['Corporate'],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetContractsQuery,
  useCreateContractMutation,
  useUpdateContractStatusMutation,
  useGetCompanyCarsQuery,
} = corporateApi;
