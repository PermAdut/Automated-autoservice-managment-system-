import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import { maintenanceReminders, users, cars, tenantSettings, appointments, services } from '../database/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { NotificationQueueService } from '../QueueModule/services/notification-queue.service';

/**
 * Scheduled jobs that push work onto the notification queue.
 *
 * The scheduler (cron) only identifies what needs to be done and enqueues jobs.
 * Actual email sending happens in NotificationProcessor (worker process).
 *
 * Benefits over inline sending:
 *  - HTTP response not blocked waiting for external APIs
 *  - Automatic retry on transient email failures
 *  - Worker scales independently from the API server
 *  - Job deduplication via jobId prevents double-sends on restart
 */
@Injectable()
export class ScheduledNotificationsService {
  private readonly logger = new Logger(ScheduledNotificationsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  /** Every day at 09:00 — queue maintenance reminders due within 7 days */
  @Cron('0 9 * * *')
  async sendMaintenanceReminders() {
    this.logger.log('Scanning for maintenance reminders...');

    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // Get company info for notifications
    const [tenant] = await this.databaseService.db
      .select({ companyName: tenantSettings.companyName, phone: tenantSettings.phone })
      .from(tenantSettings)
      .limit(1);

    const companyName = tenant?.companyName || 'АвтоСервис';
    const companyPhone = tenant?.phone || undefined;

    const due = await this.databaseService.readDb
      .select({
        reminderId: maintenanceReminders.id,
        userId: maintenanceReminders.userId,
        carId: maintenanceReminders.carId,
        type: maintenanceReminders.type,
        dueDate: maintenanceReminders.dueDate,
        dueMileage: maintenanceReminders.dueMileage,
        userEmail: users.email,
        userName: users.name,
        carBrand: cars.brand,
        carModel: cars.model,
        carYear: cars.year,
      })
      .from(maintenanceReminders)
      .leftJoin(users, eq(maintenanceReminders.userId, users.id))
      .leftJoin(cars, eq(maintenanceReminders.carId, cars.id))
      .where(
        and(
          eq(maintenanceReminders.isSent, false),
          eq(maintenanceReminders.isCompleted, false),
          lte(maintenanceReminders.dueDate, sevenDaysLater),
          gte(maintenanceReminders.dueDate, now),
        ),
      );

    this.logger.log(`Queueing ${due.length} maintenance reminders`);

    for (const reminder of due) {
      const carInfo = [reminder.carBrand, reminder.carModel, reminder.carYear]
        .filter(Boolean)
        .join(' ');

      await this.notificationQueue.addMaintenanceReminderJob({
        reminderId: reminder.reminderId,
        userId: reminder.userId,
        carInfo,
        type: reminder.type,
        dueDate: reminder.dueDate?.toLocaleDateString('ru-RU'),
        dueMileage: reminder.dueMileage ?? undefined,
        userEmail: reminder.userEmail ?? undefined,
        userName: reminder.userName ?? undefined,
        companyName,
        companyPhone,
      });
    }

    this.logger.log('Maintenance reminder jobs enqueued');
  }

  /** Every hour — queue appointment reminders ~24h before scheduledAt */
  @Cron(CronExpression.EVERY_HOUR)
  async sendAppointmentReminders() {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const [tenant] = await this.databaseService.db
      .select({ companyName: tenantSettings.companyName, phone: tenantSettings.phone })
      .from(tenantSettings)
      .limit(1);

    const companyName = tenant?.companyName || 'АвтоСервис';
    const companyPhone = tenant?.phone || undefined;

    const upcoming = await this.databaseService.readDb
      .select({
        appointmentId: appointments.id,
        userId: appointments.userId,
        scheduledAt: appointments.scheduledAt,
        confirmationCode: appointments.confirmationCode,
        userEmail: users.email,
        userName: users.name,
        serviceName: services.name,
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          sql`${appointments.status} IN ('pending', 'confirmed')`,
          gte(appointments.scheduledAt, windowStart),
          lte(appointments.scheduledAt, windowEnd),
        ),
      );

    this.logger.log(`Queueing ${upcoming.length} appointment reminders (24h window)`);

    for (const appt of upcoming) {
      await this.notificationQueue.addAppointmentReminderJob({
        appointmentId: appt.appointmentId,
        userId: appt.userId,
        scheduledAt: appt.scheduledAt.toLocaleString('ru-RU'),
        confirmationCode: appt.confirmationCode ?? undefined,
        serviceName: appt.serviceName ?? undefined,
        userEmail: appt.userEmail ?? undefined,
        userName: appt.userName ?? undefined,
        companyName,
        companyPhone,
      });
    }
  }

  /** Midnight — placeholder for future batch warranty status updates */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async batchStatusChecks() {
    // Warranty expiry handled lazily in WarrantyService.findById.
    // Future: batch UPDATE warranties SET status='expired' WHERE expiresAt < NOW()
    this.logger.debug('Nightly batch checks completed');
  }
}
