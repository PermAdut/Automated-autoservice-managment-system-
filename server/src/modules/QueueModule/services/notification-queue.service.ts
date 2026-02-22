import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NOTIFICATION_QUEUE,
  JOB_SEND_SMS,
  JOB_SEND_EMAIL,
  JOB_ORDER_NOTIFICATION,
  JOB_MAINTENANCE_REMINDER,
  JOB_BOOKING_CONFIRMATION,
  DEFAULT_JOB_OPTIONS,
  SendSmsJobData,
  SendEmailJobData,
  OrderNotificationJobData,
  MaintenanceReminderJobData,
  BookingConfirmationJobData,
} from '../queue.constants';

/**
 * Adds notification jobs to the BullMQ queue.
 * Inject this service into any module that needs to send notifications asynchronously.
 *
 * HTTP request returns immediately; the worker process handles actual sending.
 */
@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue,
  ) {}

  async addSmsJob(data: SendSmsJobData): Promise<void> {
    await this.queue.add(JOB_SEND_SMS, data, DEFAULT_JOB_OPTIONS);
    this.logger.debug(`SMS job queued → ${data.phone}`);
  }

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
      // Deduplicate: don't re-queue if already pending for this reminder
      jobId: `reminder:${data.reminderId}`,
    });
    this.logger.debug(`Maintenance reminder queued: ${data.reminderId}`);
  }

  async addBookingConfirmationJob(data: BookingConfirmationJobData): Promise<void> {
    await this.queue.add(JOB_BOOKING_CONFIRMATION, data, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `booking:${data.appointmentId}`,
    });
    this.logger.debug(`Booking confirmation queued: ${data.appointmentId}`);
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
