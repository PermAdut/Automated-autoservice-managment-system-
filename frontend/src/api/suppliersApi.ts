import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
  positionsForBuying?: {
    id: number;
    quantity: number;
    deliverDate: string;
    status: string;
  }[];
}

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<
      Supplier[],
      { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" }
    >({
      query: (params) => ({
        url: "/supplier",
        params,
      }),
      providesTags: [apiTags.SUPPLIERS],
    }),
    getSupplierById: builder.query<Supplier, number>({
      query: (id) => `/supplier/${id}`,
      providesTags: (_result, _error, id) => [{ type: apiTags.SUPPLIER, id }],
    }),
    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      query: (body) => ({
        url: "/supplier",
        method: "POST",
        body,
      }),
      invalidatesTags: [apiTags.SUPPLIERS],
    }),
    updateSupplier: builder.mutation<
      Supplier,
      { id: number; data: Partial<Supplier> }
    >({
      query: ({ id, data }) => ({
        url: `/supplier/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: apiTags.SUPPLIER, id },
        apiTags.SUPPLIERS,
      ],
    }),
    deleteSupplier: builder.mutation<void, number>({
      query: (id) => ({
        url: `/supplier/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [apiTags.SUPPLIERS],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
