export const NOTIFICATION_QUEUE = 'notifications';

export const JOB_SEND_SMS = 'send-sms';
export const JOB_SEND_EMAIL = 'send-email';
export const JOB_MAINTENANCE_REMINDER = 'maintenance-reminder';
export const JOB_ORDER_NOTIFICATION = 'order-notification';
export const JOB_BOOKING_CONFIRMATION = 'booking-confirmation';

// Default job options: 3 retries with exponential backoff
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

// Job data types
export interface SendSmsJobData {
  phone: string;
  message: string;
  userId?: string;
  notificationId?: string;
}

export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  notificationId?: string;
}

export interface OrderNotificationJobData {
  userId: string;
  orderId: string;
  orderNumber: string;
  status: string;
  userPhone?: string;
  userEmail?: string;
  userName?: string;
  companyName?: string;
}

export interface MaintenanceReminderJobData {
  reminderId: string;
  userId: string;
  carInfo: string;
  type: string;
  dueDate?: string;
  dueMileage?: number;
  userPhone?: string;
  userEmail?: string;
  userName?: string;
  companyName?: string;
  companyPhone?: string;
}

export interface BookingConfirmationJobData {
  userId: string;
  appointmentId: string;
  confirmationCode: string;
  scheduledAt: string;
  serviceName?: string;
  userPhone?: string;
  userEmail?: string;
  userName?: string;
  companyName?: string;
  companyPhone?: string;
}
