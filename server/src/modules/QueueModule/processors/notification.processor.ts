import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  NOTIFICATION_QUEUE,
  JOB_SEND_SMS,
  JOB_SEND_EMAIL,
  JOB_ORDER_NOTIFICATION,
  JOB_MAINTENANCE_REMINDER,
  JOB_BOOKING_CONFIRMATION,
  SendSmsJobData,
  SendEmailJobData,
  OrderNotificationJobData,
  MaintenanceReminderJobData,
  BookingConfirmationJobData,
} from '../queue.constants';
import { SmsService } from '../../NotificationModule/sms.service';
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
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`Processing job ${job.id} (${job.name}), attempt ${job.attemptsMade + 1}`);

    switch (job.name) {
      case JOB_SEND_SMS:
        return this.handleSendSms(job.data as SendSmsJobData);
      case JOB_SEND_EMAIL:
        return this.handleSendEmail(job.data as SendEmailJobData);
      case JOB_ORDER_NOTIFICATION:
        return this.handleOrderNotification(job.data as OrderNotificationJobData);
      case JOB_MAINTENANCE_REMINDER:
        return this.handleMaintenanceReminder(job.data as MaintenanceReminderJobData);
      case JOB_BOOKING_CONFIRMATION:
        return this.handleBookingConfirmation(job.data as BookingConfirmationJobData);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  // ── Job handlers ──────────────────────────────────────────────────────────

  private async handleSendSms(data: SendSmsJobData): Promise<void> {
    const result = await this.smsService.send(data.phone, data.message);
    if (!result.success) {
      throw new Error(`SMS failed: ${result.error}`); // triggers BullMQ retry
    }
    this.logger.log(`SMS sent to ${data.phone}`);
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

    if (data.userPhone) {
      const message = this.smsService.formatOrderStatusMessage(data.status, data.orderNumber);
      const result = await this.smsService.send(data.userPhone, message);
      if (!result.success) this.logger.warn(`Order SMS failed: ${result.error}`);
    }

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

    if (data.userPhone) {
      await this.smsService.send(
        data.userPhone,
        `${companyName}: напоминание о ТО (${data.type}) для авто ${data.carInfo}. Запись: ${data.companyPhone || 'звоните нам'}`,
      );
    }

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

    // Mark as sent in DB
    await this.databaseService.db
      .update(maintenanceReminders)
      .set({ isSent: true })
      .where(eq(maintenanceReminders.id, data.reminderId));
  }

  private async handleBookingConfirmation(data: BookingConfirmationJobData): Promise<void> {
    const companyName = data.companyName || 'АвтоСервис';

    if (data.userPhone) {
      const message = this.smsService.formatAppointmentConfirmation(
        data.confirmationCode,
        data.scheduledAt,
      );
      await this.smsService.send(data.userPhone, message);
    }

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
}
