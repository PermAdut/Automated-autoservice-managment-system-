import { baseApi } from './baseApi';
import { apiTags } from './tags';

export interface SparePartStock {
  store_id: number;
  location: string;
  quantity: number;
  sparePart: {
    id: number;
    name: string;
    partNumber: string;
    price: string;
    category: {
      id: number;
      name: string;
      description: string;
    };
  };
}

export const sparePartsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpareParts: builder.query<SparePartStock[], { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({
      query: (params) => ({
        url: '/stores',
        params,
      }),
      providesTags: [apiTags.SPARE_PARTS],
    }),
    getSparePartById: builder.query<SparePartStock, number>({
      query: (id) => `/stores/${id}`,
      providesTags: (result, error, id) => [{ type: apiTags.SPARE_PART, id }],
    }),
    createSparePart: builder.mutation<SparePartStock, Partial<SparePartStock>>({
      query: (body) => ({
        url: '/stores',
        method: 'POST',
        body,
      }),
      invalidatesTags: [apiTags.SPARE_PARTS],
    }),
    updateSparePart: builder.mutation<SparePartStock, { id: number; data: Partial<SparePartStock> }>({
      query: ({ id, data }) => ({
        url: `/stores/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: apiTags.SPARE_PART, id },
        apiTags.SPARE_PARTS,
      ],
    }),
    deleteSparePart: builder.mutation<void, number>({
      query: (id) => ({
        url: `/stores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [apiTags.SPARE_PARTS],
    }),
  }),
});

export const {
  useGetSparePartsQuery,
  useGetSparePartByIdQuery,
  useCreateSparePartMutation,
  useUpdateSparePartMutation,
  useDeleteSparePartMutation,
} = sparePartsApi;

