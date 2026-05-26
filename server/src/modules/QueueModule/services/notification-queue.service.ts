import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NOTIFICATION_QUEUE,
  JOB_SEND_EMAIL,
  JOB_ORDER_NOTIFICATION,
  JOB_MAINTENANCE_REMINDER,
  JOB_BOOKING_CONFIRMATION,
  JOB_APPOINTMENT_REMINDER,
  DEFAULT_JOB_OPTIONS,
  SendEmailJobData,
  OrderNotificationJobData,
  MaintenanceReminderJobData,
  BookingConfirmationJobData,
  AppointmentReminderJobData,
} from '../queue.constants';

/**
 * Adds notification jobs to the BullMQ queue.
 * Inject this service into any module that needs to send notifications asynchronously.
 */
@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue,
  ) {}

  async addEmailJob(data: SendEmailJobData): Promise<void> {
    await this.queue.add(JOB_SEND_EMAIL, data, DEFAULT_JOB_OPTIONS);
    this.logger.debug(`Email job queued → ${data.to}`);
  }

  async addOrderNotificationJob(data: OrderNotificationJobData): Promise<void> {
    await this.queue.add(JOB_ORDER_NOTIFICATION, data, DEFAULT_JOB_OPTIONS);
    this.logger.debug(`Order notification queued: order=${data.orderId} status=${data.status}`);
  }

  async addMaintenanceReminderJob(data: MaintenanceReminderJobData): Promise<void> {
    await this.queue.add(JOB_MAINTENANCE_REMINDER, data, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `reminder-${data.reminderId}`,
    });
    this.logger.debug(`Maintenance reminder queued: ${data.reminderId}`);
  }

  async addBookingConfirmationJob(data: BookingConfirmationJobData): Promise<void> {
    await this.queue.add(JOB_BOOKING_CONFIRMATION, data, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `booking-${data.appointmentId}`,
    });
    this.logger.debug(`Booking confirmation queued: ${data.appointmentId}`);
  }

  async addAppointmentReminderJob(data: AppointmentReminderJobData): Promise<void> {
    await this.queue.add(JOB_APPOINTMENT_REMINDER, data, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `appt-reminder-${data.appointmentId}`,
    });
    this.logger.debug(`Appointment reminder queued: ${data.appointmentId}`);
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }
}
