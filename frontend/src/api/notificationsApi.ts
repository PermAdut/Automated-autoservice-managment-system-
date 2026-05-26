import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export type NotificationChannel = "email" | "sms" | "push";
export type NotificationStatus = "pending" | "sent" | "failed" | "delivered";

export interface Notification {
  id: string;
  userId: string;
  templateId: string | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject: string | null;
  body: string;
  recipient: string;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AdminNotification extends Notification {
  userName: string | null;
  userSurName: string | null;
  userEmail: string | null;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<Notification[], void>({
      query: () => "/notifications/my",
      providesTags: [apiTags.Notifications],
    }),
    getAllNotifications: builder.query<AdminNotification[], void>({
      query: () => "/notifications",
      providesTags: [apiTags.Notifications],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetAllNotificationsQuery,
} = notificationsApi;
