import { baseApi } from "./baseApi";

export interface KpiData {
  period: string;
  orders: { current: number; previous: number; growth: number | null };
  revenue: { current: number; previous: number; growth: number | null };
  newUsers: { current: number; previous: number; growth: number | null };
  averageRating: string | null;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  count: number;
}

export interface TopService {
  serviceId: string;
  name: string;
  orderCount: number;
  totalRevenue: number;
}

export interface TopEmployee {
  employeeId: string;
  name: string;
  orderCount: number;
  avgRating: number;
}

export interface LowStockItem {
  sparePartId: string;
  name: string;
  partNumber: string;
  totalQuantity: number;
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardKpi: builder.query<KpiData, "today" | "week" | "month" | "year" | void>({
      query: (period) => ({
        url: "/analytics/kpi",
        params: period ? { period } : {},
      }),
    }),
    getOrdersByStatus: builder.query<OrdersByStatus[], void>({
      query: () => "/analytics/orders-by-status",
    }),
    getRevenueByMonth: builder.query<RevenueByMonth[], void>({
      query: () => "/analytics/revenue-by-month",
    }),
    getTopServices: builder.query<TopService[], number | void>({
      query: (limit) => ({
        url: "/analytics/top-services",
        params: limit ? { limit } : {},
      }),
    }),
    getTopEmployees: builder.query<TopEmployee[], number | void>({
      query: (limit) => ({
        url: "/analytics/top-employees",
        params: limit ? { limit } : {},
      }),
    }),
    getLowStock: builder.query<LowStockItem[], number | void>({
      query: (threshold) => ({
        url: "/analytics/low-stock",
        params: threshold ? { threshold } : {},
      }),
    }),
    getUpcomingAppointments: builder.query<{ day: string; count: number }[], void>({
      query: () => "/analytics/upcoming-appointments",
    }),
    getLoyaltySummary: builder.query<{ tier: string; count: number; totalPoints: number }[], void>({
      query: () => "/analytics/loyalty-summary",
    }),
  }),
});

export const {
  useGetDashboardKpiQuery,
  useGetOrdersByStatusQuery,
  useGetRevenueByMonthQuery,
  useGetTopServicesQuery,
  useGetTopEmployeesQuery,
  useGetLowStockQuery,
  useGetUpcomingAppointmentsQuery,
  useGetLoyaltySummaryQuery,
} = analyticsApi;
