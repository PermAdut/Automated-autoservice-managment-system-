import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import { NotificationService } from '../NotificationModule/notification.service';
import {
  employees,
  workSchedules,
  subscriptions,
  users,
} from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class EmployeeAvailabilityService {
  private readonly logger = new Logger(EmployeeAvailabilityService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateEmployeeAvailability() {
    try {
      const now = new Date();

      // Один запрос: получаем все расписания с данными сотрудников и наличием pending-заказов
      const schedulesWithData = await this.databaseService.db
        .select({
          scheduleId: workSchedules.id,
          startTime: workSchedules.startTime,
          endTime: workSchedules.endTime,
          isAvailable: workSchedules.isAvailable,
          employeeId: employees.id,
          employeeName: employees.name,
          employeeSurName: employees.surName,
          hasPendingOrder: sql<boolean>`EXISTS (
            SELECT 1 FROM autoservice."Orders" o
            WHERE o."employeeId" = ${employees.id}
            AND o.status = 'pending'
          )`.as('has_pending_order'),
        })
        .from(workSchedules)
        .innerJoin(employees, eq(employees.id, workSchedules.employeeId));

      // Группируем обновления для batch-обработки
      const updates: Array<{
        scheduleId: string;
        isAvailable: boolean;
        employeeId: string;
        employeeName: string;
        employeeSurName: string;
        wasAvailable: boolean | null;
      }> = [];

      for (const row of schedulesWithData) {
        const startTime = new Date(row.startTime);
        const endTime = new Date(row.endTime);
        const isWithinSchedule = now >= startTime && now <= endTime;
        const isAvailable = isWithinSchedule && !row.hasPendingOrder;

        if (row.isAvailable !== isAvailable) {
          updates.push({
            scheduleId: row.scheduleId,
            isAvailable,
            employeeId: row.employeeId,
            employeeName: row.employeeName,
            employeeSurName: row.employeeSurName,
            wasAvailable: row.isAvailable,
          });
        }
      }

      // Обновляем только изменившиеся записи
      for (const update of updates) {
        await this.databaseService.db
          .update(workSchedules)
          .set({ isAvailable: update.isAvailable })
          .where(eq(workSchedules.id, update.scheduleId));

        // Уведомляем подписчиков если сотрудник стал доступен
        if (update.isAvailable && !update.wasAvailable) {
          await this.notifySubscribers(
            update.employeeId,
            update.employeeName,
            update.employeeSurName,
          );
        }
      }

      console.log(
        `Employee availability updated: ${updates.length} changes out of ${schedulesWithData.length} schedules`,
      );
    } catch (error) {
      console.error('Error updating employee availability:', error);
    }
  }

  private async notifySubscribers(
    employeeId: string,
    employeeName: string,
    employeeSurName: string,
  ) {
    try {
      const activeSubscriptions = await this.databaseService.db
        .select({
          userId: subscriptions.userId,
          userEmail: users.email,
          userName: users.name,
          userSurName: users.surName,
        })
        .from(subscriptions)
        .innerJoin(users, eq(users.id, subscriptions.userId))
        .where(
          and(
            eq(subscriptions.employeeId, employeeId),
            sql`${subscriptions.dateEnd} > CURRENT_TIMESTAMP`,
          ),
        );

      for (const subscription of activeSubscriptions) {
        const message =
          `Рабочий ${employeeName} ${employeeSurName} теперь доступен для записи.`;
        await this.notificationService.notifyUser(
          subscription.userId,
          'Мастер доступен',
          message,
          subscription.userEmail ?? subscription.userId,
        );

        if (subscription.userEmail) {
          this.logger.log(
            `Availability notification sent to ${subscription.userEmail}`,
          );
        }
      }
    } catch (error) {
      console.error('Error notifying subscribers:', error);
    }
  }
}
