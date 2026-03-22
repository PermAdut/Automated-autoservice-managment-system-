export const getOrderStatusLabel = (
  status: string | null | undefined
): string => {
  if (!status) return "Не задан";

  const statusMap: Record<string, string> = {
    pending: "Ожидает",
    in_progress: "В работе",
    completed: "Завершен",
    cancelled: "Отменен",
  };

  return statusMap[status] || status;
};

export const getOrderStatusOptions = () => [
  { value: "", label: "Не задан" },
  { value: "pending", label: "Ожидает" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Завершен" },
];
