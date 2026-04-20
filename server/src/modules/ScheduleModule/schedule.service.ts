import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  orders,
  employees,
  workSchedules,
  loyaltyPrograms,
  services,
  servicesOrders,
} from '../database/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { EventsGateway } from '../GatewayModule/events.gateway';

export interface ScheduleSlot {
  orderId: string;
  employeeId: string;
  employeeName: string;
  startAt: Date;
  endAt: Date;
  status: string;
  serviceNames: string[];
  priority: number;
}

export interface GanttRow {
  employeeId: string;
  employeeName: string;
  slots: ScheduleSlot[];
}

/**
 * FT-10: Post Load Optimization Algorithm
 *
 * Priority formula: urgency × 0.5 + complexity × 0.3 + clientLevel × 0.2
 *  - urgency: 2 for urgent orders, 1 for normal
 *  - complexity: service duration in hours (normalized to 0-1 scale, max 8h)
 *  - clientLevel: 1.2 for platinum/gold loyalty, 1.0 for others
 *
 * Algorithm:
 *  1. Collect available employees and their free time slots in the next `windowHours`.
 *  2. Sort pending orders by priority (highest first).
 *  3. For each order, find the earliest available employee + assign.
 *  4. Reserve the slot so other orders don't conflict.
 */
@Injectable()
export class ScheduleOptimizationService {
  private readonly logger = new Logger(ScheduleOptimizationService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly gateway: EventsGateway,
  ) {}

  async getGanttData(date: string): Promise<GanttRow[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all employees
    const allEmployees = await this.databaseService.db
      .select({ id: employees.id, name: employees.name, surName: employees.surName })
      .from(employees);

    // Get orders scheduled for this day
    const dayOrders = await this.databaseService.db
      .select({
        id: orders.id,
        employeeId: orders.employeeId,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, dayStart),
          lte(orders.createdAt, dayEnd),
        ),
      );

    // Build gantt rows
    const rows: GanttRow[] = [];

    for (const emp of allEmployees) {
      const empOrders = dayOrders.filter(o => o.employeeId === emp.id);
      const slots: ScheduleSlot[] = [];

      for (const order of empOrders) {
        // Get service names for this order
        const orderServices = await this.databaseService.db
          .select({ name: services.name, durationMinutes: services.durationMinutes })
          .from(servicesOrders)
          .leftJoin(services, eq(servicesOrders.servicesId, services.id))
          .where(eq(servicesOrders.orderId, order.id));

        const totalDurationMin = orderServices.reduce((sum, s) => sum + (Number(s.durationMinutes) || 60), 0);
        const startAt = order.updatedAt ?? order.createdAt;
        const endAt = new Date(startAt.getTime() + totalDurationMin * 60 * 1000);

        slots.push({
          orderId: order.id,
          employeeId: emp.id,
          employeeName: `${emp.name} ${emp.surName}`,
          startAt,
          endAt,
          status: order.status ?? 'pending',
          serviceNames: orderServices.map(s => s.name ?? '').filter(Boolean),
          priority: 1,
        });
      }

      rows.push({
        employeeId: emp.id,
        employeeName: `${emp.name} ${emp.surName}`,
        slots,
      });
    }

    return rows;
  }

  async optimizeSchedule(windowHours = 8): Promise<{
    assignments: { orderId: string; employeeId: string; reason?: string }[];
    unscheduled: { orderId: string; reason: string }[];
  }> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

    // Step 1 — get pending/unassigned orders
    const pendingOrders = await this.databaseService.db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(
        sql`${orders.status} IN ('pending', 'created') AND ${orders.employeeId} IS NULL`,
      )
      .orderBy(desc(orders.createdAt))
      .limit(50);

    if (pendingOrders.length === 0) {
      return { assignments: [], unscheduled: [] };
    }

    // Step 2 — get available employees with schedules
    const availableEmployees = await this.databaseService.db
      .select({
        id: employees.id,
        name: employees.name,
        surName: employees.surName,
        startTime: workSchedules.startTime,
        endTime: workSchedules.endTime,
        isAvailable: workSchedules.isAvailable,
      })
      .from(employees)
      .leftJoin(workSchedules, eq(workSchedules.employeeId, employees.id))
      .where(
        and(
          eq(workSchedules.isAvailable, true),
          lte(workSchedules.startTime, windowEnd),
          gte(workSchedules.endTime, now),
        ),
      );

    // Step 3 — build priority-sorted order list
    const enrichedOrders = await Promise.all(
      pendingOrders.map(async (order) => {
        // Get service complexity (total duration)
        const orderServices = await this.databaseService.db
          .select({ durationMinutes: services.durationMinutes })
          .from(servicesOrders)
          .leftJoin(services, eq(servicesOrders.servicesId, services.id))
          .where(eq(servicesOrders.orderId, order.id));

        const totalDurationMin = orderServices.reduce((sum, s) => sum + (Number(s.durationMinutes) || 60), 0);
        const complexityNorm = Math.min(totalDurationMin / 480, 1); // normalize to 8h

        // Get loyalty tier
        const [loyalty] = await this.databaseService.db
          .select({ tier: loyaltyPrograms.tier })
          .from(loyaltyPrograms)
          .where(eq(loyaltyPrograms.userId, order.userId))
          .limit(1);

        const clientLevel = ['platinum', 'gold'].includes(loyalty?.tier ?? '') ? 1.2 : 1.0;
        const urgency = order.status === 'urgent' ? 2 : 1;
        const priority = urgency * 0.5 + complexityNorm * 0.3 + clientLevel * 0.2;

        return { ...order, priority, totalDurationMin };
      }),
    );

    enrichedOrders.sort((a, b) => b.priority - a.priority);

    // Step 4 — greedy assignment
    const assignments: { orderId: string; employeeId: string; reason?: string }[] = [];
    const unscheduled: { orderId: string; reason: string }[] = [];
    const employeeBusyUntil: Record<string, Date> = {};

    for (const order of enrichedOrders) {
      let assigned = false;

      for (const emp of availableEmployees) {
        const busyUntil = employeeBusyUntil[emp.id] ?? (emp.startTime ?? now);
        const slotStart = busyUntil < now ? now : busyUntil;
        const slotEnd = new Date(slotStart.getTime() + order.totalDurationMin * 60 * 1000);

        if (slotEnd <= windowEnd) {
          // Assign
          await this.databaseService.db
            .update(orders)
            .set({ employeeId: emp.id, updatedAt: slotStart })
            .where(eq(orders.id, order.id));

          employeeBusyUntil[emp.id] = slotEnd;
          assignments.push({ orderId: order.id, employeeId: emp.id });

          // Notify via WebSocket
          this.gateway.notifyOrderUpdated(order.userId, order.id, order.status ?? 'pending');

          assigned = true;
          break;
        }
      }

      if (!assigned) {
        unscheduled.push({ orderId: order.id, reason: 'No available employee in window' });
      }
    }

    this.logger.log(`Optimization: ${assignments.length} assigned, ${unscheduled.length} unscheduled`);
    return { assignments, unscheduled };
  }

  async reassignOrder(orderId: string, employeeId: string): Promise<void> {
    const [order] = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) throw new Error(`Order ${orderId} not found`);

    await this.databaseService.db
      .update(orders)
      .set({ employeeId, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    this.gateway.notifyOrderUpdated(order.userId, orderId, order.status ?? 'pending');
    this.logger.log(`Order ${orderId} manually reassigned to employee ${employeeId}`);
  }
}
