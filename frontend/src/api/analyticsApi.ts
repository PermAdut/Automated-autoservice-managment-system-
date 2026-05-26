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
  surName?: string;
  orderCount: number;
  avgRating: number;
}

export interface LowStockItem {
  sparePartId: string;
  name: string;
  partNumber: string;
  totalQuantity: number;
}

export interface BranchComparison {
  branchId: string;
  branchName: string;
  orderCount: number;
  revenue: number;
}

type AnalyticsParams = { branchId?: string };

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardKpi: builder.query<
      KpiData,
      { period?: "today" | "week" | "month" | "year"; branchId?: string }
    >({
      query: ({ period, branchId } = {}) => ({
        url: "/analytics/kpi",
        params: { ...(period ? { period } : {}), ...(branchId ? { branchId } : {}) },
      }),
    }),
    getOrdersByStatus: builder.query<OrdersByStatus[], AnalyticsParams | void>({
      query: (params) => ({
        url: "/analytics/orders-by-status",
        params: params?.branchId ? { branchId: params.branchId } : {},
      }),
    }),
    getRevenueByMonth: builder.query<RevenueByMonth[], AnalyticsParams | void>({
      query: (params) => ({
        url: "/analytics/revenue-by-month",
        params: params?.branchId ? { branchId: params.branchId } : {},
      }),
    }),
    getTopServices: builder.query<TopService[], { limit?: number; branchId?: string } | void>({
      query: (params) => ({
        url: "/analytics/top-services",
        params: {
          ...(params?.limit ? { limit: params.limit } : {}),
          ...(params?.branchId ? { branchId: params.branchId } : {}),
        },
      }),
    }),
    getTopEmployees: builder.query<TopEmployee[], { limit?: number; branchId?: string } | void>({
      query: (params) => ({
        url: "/analytics/top-employees",
        params: {
          ...(params?.limit ? { limit: params.limit } : {}),
          ...(params?.branchId ? { branchId: params.branchId } : {}),
        },
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
    getBranchesComparison: builder.query<BranchComparison[], void>({
      query: () => "/analytics/branches-comparison",
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
  useGetBranchesComparisonQuery,
} = analyticsApi;
