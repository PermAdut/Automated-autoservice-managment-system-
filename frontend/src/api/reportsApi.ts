import { baseApi } from "./baseApi";

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportData {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReport: builder.query<ReportData, string>({
      query: (type) => `/reports/${type}`,
    }),
  }),
});

export const { useLazyGetReportQuery } = reportsApi;
