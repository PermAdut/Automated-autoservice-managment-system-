import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import { employees, workSchedules, orders } from '../database/schema';
import { eq, and } from 'drizzle-orm';

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

          await this.databaseService.db
            .update(workSchedules)
            .set({ isAvailable })
            .where(eq(workSchedules.id, schedule.id));
        }
      }

      console.log('Employee availability updated manually');
    } catch (error) {
      console.error('Error updating employee availability:', error);
    }
  }
}
