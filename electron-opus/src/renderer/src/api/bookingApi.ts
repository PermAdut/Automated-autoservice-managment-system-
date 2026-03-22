import { baseApi } from "./baseApi";

export interface TimeSlot {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  carId: string;
  serviceId: string | null;
  employeeId: string | null;
  timeSlotId: string | null;
  status: string;
  scheduledAt: string;
  notes: string | null;
  confirmationCode: string;
  createdAt: string;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableSlots: builder.query<
      TimeSlot[],
      { employeeId: string; date: string }
    >({
      query: (params) => ({
        url: "/booking/slots",
        params,
      }),
      providesTags: ["Booking"],
    }),
    createAppointment: builder.mutation<
      Appointment,
      {
        carId: string;
        serviceId?: string;
        employeeId?: string;
        timeSlotId?: string;
        scheduledAt: string;
        notes?: string;
      }
    >({
      query: (body) => ({
        url: "/booking",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),
    getMyAppointments: builder.query<Appointment[], void>({
      query: () => "/booking/my",
      providesTags: ["Booking"],
    }),
    getAllAppointments: builder.query<Appointment[], void>({
      query: () => "/booking",
      providesTags: ["Booking"],
    }),
    cancelAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/booking/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetAvailableSlotsQuery,
  useCreateAppointmentMutation,
  useGetMyAppointmentsQuery,
  useGetAllAppointmentsQuery,
  useCancelAppointmentMutation,
} = bookingApi;
