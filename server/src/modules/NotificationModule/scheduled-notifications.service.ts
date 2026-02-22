import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import { maintenanceReminders, users, cars } from '../database/schema';
import { eq, and, lte, gte, isNull } from 'drizzle-orm';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';

/**
 * Scheduled notification jobs.
 * Runs on top of @nestjs/schedule which is already registered in AppModule.
 */
@Injectable()
export class ScheduledNotificationsService {
  private readonly logger = new Logger(ScheduledNotificationsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Every day at 9:00 — send maintenance reminders due in ≤ 7 days.
   */
  @Cron('0 9 * * *')
  async sendMaintenanceReminders() {
    this.logger.log('Running maintenance reminder job...');

    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // Find unsent reminders due within 7 days
    const due = await this.databaseService.db
      .select({
        reminderId: maintenanceReminders.id,
        userId: maintenanceReminders.userId,
        carId: maintenanceReminders.carId,
        type: maintenanceReminders.type,
        dueDate: maintenanceReminders.dueDate,
        dueMileage: maintenanceReminders.dueMileage,
        description: maintenanceReminders.description,
        userEmail: users.email,
        userPhone: users.phone,
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

    this.logger.log(`Found ${due.length} pending maintenance reminders`);

    for (const reminder of due) {
      const carInfo = [reminder.carBrand, reminder.carModel, reminder.carYear]
        .filter(Boolean)
        .join(' ');
      const customerName = reminder.userName ?? 'Клиент';

      // Send SMS
      if (reminder.userPhone) {
        const message = this.smsService.formatOrderStatusMessage(
          reminder.type,
          reminder.carId,
        );
        // Use a maintenance-specific SMS format
        await this.smsService.send(
          reminder.userPhone,
          `АвтоСервис: напоминание о ТО (${reminder.type}) для авто ${carInfo}. Свяжитесь с нами для записи.`,
        );
      }

      // Send Email
      if (reminder.userEmail) {
        const { subject, html } = this.emailService.buildMaintenanceReminderEmail({
          customerName,
          carInfo,
          reminderType: reminder.type,
          dueDate: reminder.dueDate?.toLocaleDateString('ru-RU'),
          dueMileage: reminder.dueMileage ?? undefined,
          companyName: 'АвтоСервис',
        });

        await this.emailService.send({
          to: reminder.userEmail,
          subject,
          html,
        });
      }

      // Mark as sent
      await this.databaseService.db
        .update(maintenanceReminders)
        .set({ isSent: true })
        .where(eq(maintenanceReminders.id, reminder.reminderId));
    }

    this.logger.log('Maintenance reminder job completed');
  }

  /**
   * Every hour — expire loyalty tier if needed (future use).
   * Every 5 min already handled by EmployeeAvailabilityService.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOldWarranties() {
    this.logger.log('Checking for expired warranties...');
    // Handled lazily in WarrantyService.findById via status check.
    // Future: batch update warranty statuses here.
  }
}
