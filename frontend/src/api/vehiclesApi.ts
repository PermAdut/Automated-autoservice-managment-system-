import { baseApi } from './baseApi';

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  licensePlate?: string;
  information?: string;
}

export interface CreateVehicleDto {
  brand: string;
  model: string;
  year: number;
  vin: string;
  licensePlate?: string;
  information?: string;
}

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyVehicles: builder.query<Vehicle[], void>({
      query: () => '/vehicle/my',
      providesTags: ['Vehicle'],
    }),
    getVehiclesByUser: builder.query<Vehicle[], string>({
      query: (userId) => `/vehicle/user/${userId}`,
      providesTags: ['Vehicle'],
    }),
    getAllVehicles: builder.query<Vehicle[], void>({
      query: () => '/vehicle/all',
      providesTags: ['Vehicle'],
    }),
    getVehicleById: builder.query<Vehicle, string>({
      query: (id) => `/vehicle/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Vehicle', id }],
    }),
    createVehicle: builder.mutation<Vehicle, CreateVehicleDto>({
      query: (body) => ({ url: '/vehicle', method: 'POST', body }),
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: builder.mutation<Vehicle, { id: string; data: Partial<CreateVehicleDto> }>({
      query: ({ id, data }) => ({ url: `/vehicle/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Vehicle'],
    }),
    deleteVehicle: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/vehicle/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Vehicle'],
    }),
    decodeVin: builder.query<Record<string, unknown>, string>({
      query: (vin) => `/vehicle/vin/${vin}`,
    }),
  }),
});

export const {
  useGetMyVehiclesQuery,
  useGetVehiclesByUserQuery,
  useGetAllVehiclesQuery,
  useGetVehicleByIdQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useDecodeVinQuery,
} = vehiclesApi;
