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
  bankAccount?: string;
  bic?: string;
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

export interface CompanyDriver {
  companyId: string;
  userId: string;
  name?: string;
  surName?: string;
  email?: string;
  phone?: string;
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
    createContract: builder.mutation<CompanyContract, {
      companyId: string;
      contractNumber?: string;
      discountPercent?: string;
      creditLimit?: string;
      paymentTermDays?: string;
      startDate: string;
      endDate: string;
      notes?: string;
    }>({
      query: ({ companyId, ...body }) => ({
        url: `/corporate/companies/${companyId}/contracts`,
        method: 'POST',
        body,
      }),
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
    getDrivers: builder.query<CompanyDriver[], string>({
      query: (companyId) => `/corporate/companies/${companyId}/drivers`,
      providesTags: ['Corporate'],
    }),
    addDriver: builder.mutation<unknown, { companyId: string; userId: string }>({
      query: ({ companyId, userId }) => ({
        url: `/corporate/companies/${companyId}/drivers`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['Corporate'],
    }),
    removeDriver: builder.mutation<void, { companyId: string; userId: string }>({
      query: ({ companyId, userId }) => ({
        url: `/corporate/companies/${companyId}/drivers/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Corporate'],
    }),
    getCompanySpend: builder.query<{ total: number }, string>({
      query: (companyId) => `/corporate/companies/${companyId}/spend`,
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
  useGetDriversQuery,
  useAddDriverMutation,
  useRemoveDriverMutation,
  useGetCompanySpendQuery,
} = corporateApi;

export function getMonthlyActUrl(companyId: string, year?: number, month?: number) {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));
  const qs = params.toString();
  return `/api/v1.0/corporate/companies/${companyId}/monthly-act${qs ? `?${qs}` : ''}`;
}
