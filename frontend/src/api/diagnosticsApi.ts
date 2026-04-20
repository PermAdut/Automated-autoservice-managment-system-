import { baseApi } from './baseApi';

export interface DiagnosticSession {
  id: string;
  carId: string;
  employeeId?: string;
  orderId?: string;
  mileage?: number;
  notes?: string;
  rawData?: string;
  createdAt: string;
}

export interface MaintenanceReminder {
  id: string;
  userId: string;
  carId: string;
  type: string;
  description?: string;
  dueDate?: string;
  dueMileage?: number;
  isSent: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateSessionDto {
  carId: string;
  mileage?: number;
  notes?: string;
  employeeId?: string;
  codes?: { codeId: string; notes?: string }[];
}

export const diagnosticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSessionsByCar: builder.query<DiagnosticSession[], string>({
      query: (carId) => `/diagnostics/sessions/car/${carId}`,
      providesTags: ['Diagnostic'],
    }),
    getSession: builder.query<DiagnosticSession, string>({
      query: (id) => `/diagnostics/sessions/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Diagnostic', id }],
    }),
    createSession: builder.mutation<DiagnosticSession, CreateSessionDto>({
      query: (body) => ({ url: '/diagnostics/sessions', method: 'POST', body }),
      invalidatesTags: ['Diagnostic'],
    }),
    getReminders: builder.query<MaintenanceReminder[], { userId?: string; carId?: string }>({
      query: ({ userId, carId }) => {
        const params = new URLSearchParams();
        if (userId) params.set('userId', userId);
        if (carId) params.set('carId', carId);
        return `/diagnostics/reminders?${params.toString()}`;
      },
      providesTags: ['Diagnostic'],
    }),
    createReminder: builder.mutation<MaintenanceReminder, Partial<MaintenanceReminder>>({
      query: (body) => ({ url: '/diagnostics/reminders', method: 'POST', body }),
      invalidatesTags: ['Diagnostic'],
    }),
    completeReminder: builder.mutation<MaintenanceReminder, string>({
      query: (id) => ({ url: `/diagnostics/reminders/${id}/complete`, method: 'PATCH' }),
      invalidatesTags: ['Diagnostic'],
    }),
    searchDtcCodes: builder.query<{ id: string; code: string; description: string }[], string>({
      query: (q) => `/diagnostics/dtc?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const {
  useGetSessionsByCarQuery,
  useGetSessionQuery,
  useCreateSessionMutation,
  useGetRemindersQuery,
  useCreateReminderMutation,
  useCompleteReminderMutation,
  useSearchDtcCodesQuery,
} = diagnosticsApi;
