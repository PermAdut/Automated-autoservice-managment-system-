import { baseApi } from './baseApi';
import { apiTags } from './tags';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
}

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<Service[], { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({
      query: (params) => ({
        url: '/services',
        params,
      }),
      providesTags: [apiTags.SERVICES],
    }),
    getServiceById: builder.query<Service, number>({
      query: (id) => `/services/${id}`,
      providesTags: (result, error, id) => [{ type: apiTags.SERVICE, id }],
    }),
    createService: builder.mutation<Service, Partial<Service>>({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: [apiTags.SERVICES],
    }),
    updateService: builder.mutation<Service, { id: number; data: Partial<Service> }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: apiTags.SERVICE, id },
        apiTags.SERVICES,
      ],
    }),
    deleteService: builder.mutation<void, number>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [apiTags.SERVICES],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;

