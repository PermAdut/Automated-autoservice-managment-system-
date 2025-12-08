import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface SparePartStock {
  id?: number;
  store_id: number;
  location: string;
  quantity: number;
  sparePart: {
    id: number;
    name: string;
    partNumber: string;
    price: string;
    category?: {
      id: number;
      name: string;
      description?: string;
    };
  };
}

export interface StoreOption {
  id: number;
  location: string;
}

export interface CategoryOption {
  id: number;
  name: string;
  description?: string;
}

export interface SpareStockPayload {
  sparePartId: number;
  storeId: number;
  quantity: number;
}

export const sparePartsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpareParts: builder.query<
      SparePartStock[],
      { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" }
    >({
      query: (params) => ({
        url: "/stores",
        params,
      }),
      providesTags: [apiTags.SPARE_PARTS],
    }),
    getSparePartById: builder.query<SparePartStock, number>({
      query: (id) => `/stores/${id}`,
      providesTags: (_result, _error, id) => [
        { type: apiTags.SPARE_PART, id },
        apiTags.SPARE_PARTS,
      ],
    }),
    createSparePart: builder.mutation<SparePartStock, SpareStockPayload>({
      query: (body) => ({
        url: "/stores",
        method: "POST",
        body,
      }),
      invalidatesTags: [apiTags.SPARE_PARTS],
    }),
    updateSparePart: builder.mutation<
      SparePartStock,
      { id: number; data: SpareStockPayload }
    >({
      query: ({ id, data }) => ({
        url: `/stores/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: apiTags.SPARE_PART, id: id },
        apiTags.SPARE_PARTS,
      ],
    }),
    deleteSparePart: builder.mutation<void, number>({
      query: (id) => ({
        url: `/stores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [apiTags.SPARE_PARTS],
    }),
    getStoresMeta: builder.query<StoreOption[], void>({
      query: () => "/stores/meta/stores",
      providesTags: [apiTags.SPARE_PARTS],
    }),
    getCategoriesMeta: builder.query<CategoryOption[], void>({
      query: () => "/stores/meta/categories",
      providesTags: [apiTags.SPARE_PARTS],
    }),
  }),
});

export const {
  useGetSparePartsQuery,
  useGetSparePartByIdQuery,
  useCreateSparePartMutation,
  useUpdateSparePartMutation,
  useDeleteSparePartMutation,
  useGetStoresMetaQuery,
  useGetCategoriesMetaQuery,
} = sparePartsApi;
