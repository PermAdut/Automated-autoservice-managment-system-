import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface SupplierPosition {
  id: string;
  quantity: number;
  deliverDate: string;
  status: string;
  sparePartName?: string;
  sparePartNumber?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
  positionsForBuying?: SupplierPosition[];
}

export interface Invoice {
  id: string;
  positionForBuyingId: string;
  amount: string;
  invoiceDate: string;
  status: string;
}

export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface CreateInvoicePayload {
  positionForBuyingId: string;
  amount: number;
  status: InvoiceStatus;
}

export interface UpdateInvoicePayload {
  amount?: number;
  status?: InvoiceStatus;
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
    getSupplierById: builder.query<Supplier, string>({
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
      { id: string; data: Partial<Supplier> }
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
    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/supplier/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [apiTags.SUPPLIERS],
    }),
    getInvoicesByPosition: builder.query<Invoice[], string>({
      query: (positionId) => `/supplier/position/${positionId}/invoices`,
      providesTags: (_result, _error, positionId) => [
        { type: apiTags.INVOICES, id: positionId },
      ],
    }),
    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => `/supplier/invoice/${id}`,
      providesTags: (_result, _error, id) => [{ type: apiTags.INVOICE, id }],
    }),
    createInvoice: builder.mutation<Invoice, CreateInvoicePayload>({
      query: (body) => ({
        url: "/supplier/invoice",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { positionForBuyingId }) => [
        { type: apiTags.INVOICES, id: positionForBuyingId },
      ],
    }),
    updateInvoice: builder.mutation<
      Invoice,
      { id: string; positionId: string; data: UpdateInvoicePayload }
    >({
      query: ({ id, data }) => ({
        url: `/supplier/invoice/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, positionId }) => [
        { type: apiTags.INVOICE, id },
        { type: apiTags.INVOICES, id: positionId },
      ],
    }),
    deleteInvoice: builder.mutation<
      void,
      { id: string; positionId: string }
    >({
      query: ({ id }) => ({
        url: `/supplier/invoice/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id, positionId }) => [
        { type: apiTags.INVOICE, id },
        { type: apiTags.INVOICES, id: positionId },
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetInvoicesByPositionQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = suppliersApi;
