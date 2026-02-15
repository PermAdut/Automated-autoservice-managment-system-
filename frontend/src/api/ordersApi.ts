import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface Order {
  id: string;
  userId: string;
  carId: string;
  employeeId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
  services?: {
    id: string;
    name: string;
    description: string;
    price: string;
  }[];
  sparePart?: {
    id: string;
    name: string;
    partNumber: string;
    price: string;
    category: {
      id: string;
      name: string;
      description: string;
    };
  }[];
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<
      Order[],
      { search?: string; sortBy?: string; sortOrder?: "asc" | "desc"; isAdmin?: boolean }
    >({
      query: (params) => ({
        url: "/orders",
        params: {
          ...params,
          isAdmin: params.isAdmin ? "true" : undefined,
        },
      }),
      providesTags: [apiTags.ORDERS],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: apiTags.ORDER, id }],
    }),
    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [apiTags.ORDERS],
    }),
    updateOrder: builder.mutation<Order, { id: string; data: Partial<Order> }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: apiTags.ORDER, id },
        apiTags.ORDERS,
      ],
    }),
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [apiTags.ORDERS],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
