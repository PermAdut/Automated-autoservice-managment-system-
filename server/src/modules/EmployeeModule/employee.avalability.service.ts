import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import {
  employees,
  workSchedules,
  orders,
  subscriptions,
  users,
} from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class EmployeeAvailabilityService {
  constructor(private readonly databaseService: DatabaseService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateEmployeeAvailability() {
    try {
      const allEmployees = await this.databaseService.db
        .select()
        .from(employees);

      const now = new Date();

      for (const employee of allEmployees) {
        // Get employee's schedule
        const schedules = await this.databaseService.db
          .select()
          .from(workSchedules)
          .where(eq(workSchedules.employeeId, employee.id));

        if (schedules.length === 0) {
          // No schedule, skip
          continue;
        }

        for (const schedule of schedules) {
          // Check if current time is within schedule
          const startTime = new Date(schedule.startTime);
          const endTime = new Date(schedule.endTime);
          const isWithinSchedule = now >= startTime && now <= endTime;

          // Check if employee has pending orders
          const pendingOrders = await this.databaseService.db
            .select()
            .from(orders)
            .where(
              and(
                eq(orders.employeeId, employee.id),
                eq(orders.status, 'pending')
              )
            )
            .limit(1);

          const hasPendingOrder = pendingOrders.length > 0;

          // Update availability: available if within schedule and no pending orders
          const isAvailable = isWithinSchedule && !hasPendingOrder;

          const previousAvailability = schedule.isAvailable;

          await this.databaseService.db
            .update(workSchedules)
            .set({ isAvailable })
            .where(eq(workSchedules.id, schedule.id));

          // Если сотрудник стал доступен и был недоступен ранее, отправляем уведомления подписчикам
          if (isAvailable && !previousAvailability) {
            await this.notifySubscribers(
              employee.id,
              employee.name,
              employee.surName
            );
          }
        }
      }

      console.log('Employee availability updated manually');
    } catch (error) {
      console.error('Error updating employee availability:', error);
    }
  }

  private async notifySubscribers(
    employeeId: number,
    employeeName: string,
    employeeSurName: string
  ) {
    try {
      // Находим всех активных подписчиков на этого сотрудника
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
            sql`${subscriptions.dateEnd} > CURRENT_TIMESTAMP`
          )
        );

      // Отправляем уведомления каждому подписчику
      for (const subscription of activeSubscriptions) {
        // Здесь можно интегрировать с системой уведомлений (email, push, и т.д.)
        // Пока просто логируем
        console.log(
          `Notification sent to ${subscription.userName} ${subscription.userSurName} (${subscription.userEmail}): ` +
            `Рабочий ${employeeName} ${employeeSurName} теперь доступен!`
        );

        // TODO: Интеграция с системой уведомлений
        // await this.notificationService.send({
        //   to: subscription.userEmail,
        //   subject: 'Рабочий доступен',
        //   message: `Рабочий ${employeeName} ${employeeSurName} теперь доступен для записи!`
        // });
      }

      if (activeSubscriptions.length > 0) {
        console.log(
          `Sent availability notifications to ${activeSubscriptions.length} subscribers for employee ${employeeId}`
        );
      }
    } catch (error) {
      console.error('Error notifying subscribers:', error);
    }
  }
}
