export const ORDER_STATUSES = [
  'pending',
  'diagnosed',
  'in_progress',
  'quality_check',
  'completed',
  'cancelled',
  'urgent',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  diagnosed: 'Диагностирован',
  in_progress: 'В работе',
  quality_check: 'Контроль качества',
  completed: 'Завершён',
  cancelled: 'Отменён',
  urgent: 'Срочный',
  // legacy DB values
  created: 'Ожидает',
  quality_control: 'Контроль качества',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  diagnosed: 'bg-sky-100 border-sky-300 text-sky-800',
  in_progress: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  quality_check: 'bg-purple-100 border-purple-300 text-purple-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  cancelled: 'bg-gray-100 border-gray-300 text-gray-500',
  urgent: 'bg-red-100 border-red-300 text-red-800',
  created: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  quality_control: 'bg-purple-100 border-purple-300 text-purple-800',
};

export const normalizeOrderStatus = (
  status: string | null | undefined,
): string => {
  if (!status || status === 'created') return 'pending';
  if (status === 'quality_control') return 'quality_check';
  return status;
};

export const getOrderStatusLabel = (
  status: string | null | undefined,
): string => {
  if (!status) return 'Не задан';
  const normalized = normalizeOrderStatus(status);
  return STATUS_LABELS[normalized] ?? STATUS_LABELS[status] ?? status;
};

export const getOrderStatusOptions = () => [
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'diagnosed', label: STATUS_LABELS.diagnosed },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'quality_check', label: STATUS_LABELS.quality_check },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'cancelled', label: STATUS_LABELS.cancelled },
];

/** Allowed next statuses from current (matches server STATUS_TRANSITIONS) */
export const getAllowedNextStatuses = (
  current: string | null | undefined,
): OrderStatus[] => {
  const normalized = normalizeOrderStatus(current) as OrderStatus;

  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['diagnosed', 'cancelled'],
    diagnosed: ['in_progress'],
    in_progress: ['quality_check', 'diagnosed', 'cancelled'],
    quality_check: ['completed', 'in_progress'],
    completed: [],
    cancelled: [],
    urgent: ['in_progress', 'cancelled'],
  };

  return transitions[normalized] ?? [];
};
