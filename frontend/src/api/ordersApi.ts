import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface Order {
  id: number;
  userId: number;
  carId: number;
  employeeId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
  services?: {
    id: number;
    name: string;
    description: string;
    price: string;
  }[];
  sparePart?: {
    id: number;
    name: string;
    partNumber: string;
    price: string;
    category: {
      id: number;
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
    getOrderById: builder.query<Order, number>({
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
    updateOrder: builder.mutation<Order, { id: number; data: Partial<Order> }>({
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
    deleteOrder: builder.mutation<void, number>({
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
