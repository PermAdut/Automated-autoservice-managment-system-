import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  NOTIFICATION_QUEUE,
  JOB_SEND_EMAIL,
  JOB_ORDER_NOTIFICATION,
  JOB_MAINTENANCE_REMINDER,
  JOB_BOOKING_CONFIRMATION,
  JOB_APPOINTMENT_REMINDER,
  SendEmailJobData,
  OrderNotificationJobData,
  MaintenanceReminderJobData,
  BookingConfirmationJobData,
  AppointmentReminderJobData,
} from '../queue.constants';
import { EmailService } from '../../NotificationModule/email.service';
import { DatabaseService } from '../../database/database.service';
import { maintenanceReminders } from '../../database/schema';
import { eq } from 'drizzle-orm';

/**
 * BullMQ processor — runs in the Worker process.
 * Handles all notification jobs with automatic retries.
 */
@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`Processing job ${job.id} (${job.name}), attempt ${job.attemptsMade + 1}`);

    switch (job.name) {
      case JOB_SEND_EMAIL:
        return this.handleSendEmail(job.data as SendEmailJobData);
      case JOB_ORDER_NOTIFICATION:
        return this.handleOrderNotification(job.data as OrderNotificationJobData);
      case JOB_MAINTENANCE_REMINDER:
        return this.handleMaintenanceReminder(job.data as MaintenanceReminderJobData);
      case JOB_BOOKING_CONFIRMATION:
        return this.handleBookingConfirmation(job.data as BookingConfirmationJobData);
      case JOB_APPOINTMENT_REMINDER:
        return this.handleAppointmentReminder(job.data as AppointmentReminderJobData);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleSendEmail(data: SendEmailJobData): Promise<void> {
    const result = await this.emailService.send({
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
    if (!result.success) {
      throw new Error(`Email failed: ${result.error}`);
    }
    this.logger.log(`Email sent to ${data.to}`);
  }

  private async handleOrderNotification(data: OrderNotificationJobData): Promise<void> {
    const companyName = data.companyName || 'АвтоСервис';

    if (data.userEmail && data.userName) {
      const { subject, html } = this.emailService.buildOrderStatusEmail({
        customerName: data.userName,
        orderNumber: data.orderNumber,
        status: data.status,
        companyName,
      });
      const result = await this.emailService.send({ to: data.userEmail, subject, html });
      if (!result.success) this.logger.warn(`Order email failed: ${result.error}`);
    }
  }

  private async handleMaintenanceReminder(data: MaintenanceReminderJobData): Promise<void> {
    const companyName = data.companyName || 'АвтоСервис';

    if (data.userEmail) {
      const { subject, html } = this.emailService.buildMaintenanceReminderEmail({
        customerName: data.userName || 'Клиент',
        carInfo: data.carInfo,
        reminderType: data.type,
        dueDate: data.dueDate,
        dueMileage: data.dueMileage,
        companyName,
        companyPhone: data.companyPhone,
      });
      await this.emailService.send({ to: data.userEmail, subject, html });
    }

    await this.databaseService.db
      .update(maintenanceReminders)
      .set({ isSent: true })
      .where(eq(maintenanceReminders.id, data.reminderId));
  }

  private async handleBookingConfirmation(data: BookingConfirmationJobData): Promise<void> {
    const companyName = data.companyName || 'АвтоСервис';

    if (data.userEmail) {
      const { subject, html } = this.emailService.buildAppointmentConfirmationEmail({
        customerName: data.userName || 'Клиент',
        dateStr: data.scheduledAt,
        confirmationCode: data.confirmationCode,
        serviceName: data.serviceName,
        companyName,
        companyPhone: data.companyPhone,
      });
      await this.emailService.send({ to: data.userEmail, subject, html });
    }
  }

  private async handleAppointmentReminder(data: AppointmentReminderJobData): Promise<void> {
    const companyName = data.companyName || 'АвтоСервис';

    if (data.userEmail) {
      const { subject, html } = this.emailService.buildAppointmentReminderEmail({
        customerName: data.userName || 'Клиент',
        dateStr: data.scheduledAt,
        confirmationCode: data.confirmationCode,
        serviceName: data.serviceName,
        companyName,
        companyPhone: data.companyPhone,
      });
      await this.emailService.send({ to: data.userEmail, subject, html });
    }
  }
}
