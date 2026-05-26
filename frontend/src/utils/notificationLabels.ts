import type { NotificationChannel, NotificationStatus } from "../api/notificationsApi";

export const channelLabels: Record<NotificationChannel, string> = {
  push: "In-app",
  email: "Email",
  sms: "SMS",
};

export const statusLabels: Record<NotificationStatus, string> = {
  pending: "Ожидание",
  sent: "Отправлено",
  failed: "Ошибка",
  delivered: "Доставлено",
};

export const statusVariants: Record<
  NotificationStatus,
  "secondary" | "success" | "destructive" | "info" | "warning"
> = {
  pending: "warning",
  sent: "success",
  failed: "destructive",
  delivered: "info",
};

export function formatNotificationDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ru-RU");
}
