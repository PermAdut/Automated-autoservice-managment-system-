import { baseApi } from "./baseApi";

export interface SyncLogEntry {
  id: string;
  userId: string;
  operation: string;
  entity: string;
  entityId: string;
  status: string;
  error?: string | null;
  syncedAt: string;
}

export const syncApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSyncLog: builder.query<SyncLogEntry[], number | void>({
      query: (limit = 50) => `/sync/log?limit=${limit}`,
    }),
    createSyncLogEntry: builder.mutation<
      SyncLogEntry,
      {
        operation: string;
        entity: string;
        entityId: string;
        status: string;
        error?: string;
      }
    >({
      query: (body) => ({
        url: "/sync/log",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetSyncLogQuery, useCreateSyncLogEntryMutation } = syncApi;
