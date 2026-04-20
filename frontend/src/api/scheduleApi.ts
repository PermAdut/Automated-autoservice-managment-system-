import { baseApi } from './baseApi';

export interface ScheduleSlot {
  orderId: string;
  employeeId: string;
  employeeName: string;
  startAt: string;
  endAt: string;
  status: string;
  serviceNames: string[];
  priority: number;
}

export interface GanttRow {
  employeeId: string;
  employeeName: string;
  slots: ScheduleSlot[];
}

export interface OptimizeResult {
  assignments: { orderId: string; employeeId: string; reason?: string }[];
  unscheduled: { orderId: string; reason: string }[];
}

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGanttData: builder.query<GanttRow[], string>({
      query: (date) => `/schedule/gantt?date=${date}`,
      providesTags: ['Schedule'],
    }),
    optimizeSchedule: builder.mutation<OptimizeResult, { windowHours?: number }>({
      query: (body) => ({ url: '/schedule/optimize', method: 'POST', body }),
      invalidatesTags: ['Schedule', 'Order'],
    }),
    reassignOrder: builder.mutation<void, { orderId: string; employeeId: string }>({
      query: (body) => ({ url: '/schedule/reassign', method: 'PATCH', body }),
      invalidatesTags: ['Schedule', 'Order'],
    }),
  }),
});

export const {
  useGetGanttDataQuery,
  useOptimizeScheduleMutation,
  useReassignOrderMutation,
} = scheduleApi;
