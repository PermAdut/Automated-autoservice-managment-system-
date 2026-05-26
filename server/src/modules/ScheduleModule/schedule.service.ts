import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EmployeeQualificationService } from '../EmployeeModule/employee-qualification.service';
import {
  orders,
  employees,
  workSchedules,
  loyaltyPrograms,
  services,
  servicesOrders,
} from '../database/schema';
import { eq, and, gte, lte, sql, desc, isNotNull, isNull } from 'drizzle-orm';
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
    private readonly qualificationService: EmployeeQualificationService,
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

    // Get orders scheduled for this day (assigned to a master)
    const dayOrders = await this.databaseService.db
      .select({
        id: orders.id,
        employeeId: orders.employeeId,
        status: orders.status,
        scheduledStartAt: orders.scheduledStartAt,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(
        and(
          isNotNull(orders.employeeId),
          isNotNull(orders.scheduledStartAt),
          gte(orders.scheduledStartAt, dayStart),
          lte(orders.scheduledStartAt, dayEnd),
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
        const startAt = order.scheduledStartAt ?? order.updatedAt ?? order.createdAt;
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

  async optimizeSchedule(options: {
    date?: string;
    windowHours?: number;
  } = {}): Promise<{
    assignments: { orderId: string; employeeId: string; reason?: string }[];
    unscheduled: { orderId: string; reason: string }[];
  }> {
    const targetDate =
      options.date ?? new Date().toISOString().slice(0, 10);
    const now = new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    const defaultShiftStart = this.dayAt(dayStart, 8);
    const defaultShiftEnd = this.dayAt(dayStart, 20);
    const isToday = targetDate === now.toISOString().slice(0, 10);

    // Pending unassigned orders planned for the selected Gantt day
    const pendingOrders = await this.databaseService.db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        scheduledStartAt: orders.scheduledStartAt,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.status} IN ('pending', 'created')`,
          isNull(orders.employeeId),
          isNotNull(orders.scheduledStartAt),
          gte(orders.scheduledStartAt, dayStart),
          lte(orders.scheduledStartAt, dayEnd),
        ),
      )
      .orderBy(desc(orders.createdAt))
      .limit(100);

    if (pendingOrders.length === 0) {
      return { assignments: [], unscheduled: [] };
    }

    type EmpSchedule = {
      id: string;
      name: string;
      surName: string;
      startTime: Date;
      endTime: Date;
    };

    const scheduleRows = await this.databaseService.db
      .select({
        id: employees.id,
        name: employees.name,
        surName: employees.surName,
        startTime: workSchedules.startTime,
        endTime: workSchedules.endTime,
      })
      .from(employees)
      .innerJoin(workSchedules, eq(workSchedules.employeeId, employees.id))
      .where(
        and(
          eq(workSchedules.isAvailable, true),
          lte(workSchedules.startTime, dayEnd),
          gte(workSchedules.endTime, dayStart),
        ),
      );

    let availableEmployees: EmpSchedule[] = this.dedupeEmployeesBySchedule(
      scheduleRows.map(r => ({
        ...r,
        startTime: r.startTime ?? defaultShiftStart,
        endTime: r.endTime ?? defaultShiftEnd,
      })),
    );

    if (availableEmployees.length === 0) {
      const allEmployees = await this.databaseService.db
        .select({
          id: employees.id,
          name: employees.name,
          surName: employees.surName,
        })
        .from(employees)
        .limit(10);

      availableEmployees = allEmployees.map(emp => ({
        ...emp,
        startTime: defaultShiftStart,
        endTime: defaultShiftEnd,
      }));
    }

    const employeeBusy = await this.loadEmployeeBusyIntervals(
      availableEmployees.map(e => e.id),
      dayStart,
      dayEnd,
    );

    const enrichedOrders = await Promise.all(
      pendingOrders.map(async (order) => {
        const totalDurationMin = await this.getOrderDurationMinutes(order.id);
        const complexityNorm = Math.min(totalDurationMin / 480, 1);

        const [loyalty] = await this.databaseService.db
          .select({ tier: loyaltyPrograms.tier })
          .from(loyaltyPrograms)
          .where(eq(loyaltyPrograms.userId, order.userId))
          .limit(1);

        const clientLevel = ['platinum', 'gold'].includes(loyalty?.tier ?? '')
          ? 1.2
          : 1.0;
        const urgency = order.status === 'urgent' ? 2 : 1;
        const priority =
          urgency * 0.5 + complexityNorm * 0.3 + clientLevel * 0.2;

        return { ...order, priority, totalDurationMin };
      }),
    );

    enrichedOrders.sort((a, b) => b.priority - a.priority);

    const assignments: { orderId: string; employeeId: string; reason?: string }[] = [];
    const unscheduled: { orderId: string; reason: string }[] = [];

    for (const order of enrichedOrders) {
      let assigned = false;

      const preferredStart = order.scheduledStartAt ?? defaultShiftStart;
      const earliestStart = isToday
        ? new Date(Math.max(preferredStart.getTime(), now.getTime()))
        : preferredStart;

      const rankedEmployees = [...availableEmployees].sort((a, b) => {
        const busyA = employeeBusy[a.id]?.length ?? 0;
        const busyB = employeeBusy[b.id]?.length ?? 0;
        return busyA - busyB;
      });

      for (const emp of rankedEmployees) {
        const isQualified =
          await this.qualificationService.isEmployeeQualifiedForOrder(
            emp.id,
            order.id,
          );
        if (!isQualified) {
          continue;
        }

        const shiftStart =
          emp.startTime > defaultShiftStart ? emp.startTime : defaultShiftStart;
        const shiftEnd =
          emp.endTime < defaultShiftEnd ? emp.endTime : defaultShiftEnd;

        const slotStart = this.findNextFreeSlot(
          employeeBusy[emp.id] ?? [],
          shiftStart,
          shiftEnd,
          order.totalDurationMin,
          earliestStart,
        );

        if (!slotStart) {
          continue;
        }

        const slotEnd = new Date(
          slotStart.getTime() + order.totalDurationMin * 60 * 1000,
        );

        await this.databaseService.db
          .update(orders)
          .set({
            employeeId: emp.id,
            scheduledStartAt: slotStart,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        if (!employeeBusy[emp.id]) {
          employeeBusy[emp.id] = [];
        }
        employeeBusy[emp.id].push({ start: slotStart, end: slotEnd });

        assignments.push({ orderId: order.id, employeeId: emp.id });
        this.gateway.notifyOrderUpdated(
          order.userId,
          order.id,
          order.status ?? 'pending',
        );

        assigned = true;
        break;
      }

      if (!assigned) {
        unscheduled.push({
          orderId: order.id,
          reason: 'No qualified available employee on selected day',
        });
      }
    }

    this.logger.log(
      `Optimization (${targetDate}): ${assignments.length} assigned, ${unscheduled.length} unscheduled`,
    );
    return { assignments, unscheduled };
  }

  async reassignOrder(
    orderId: string,
    employeeId: string,
  ): Promise<{ warning?: string }> {
    const [order] = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) throw new Error(`Order ${orderId} not found`);

    const warning =
      (await this.qualificationService.getQualificationMismatch(
        employeeId,
        orderId,
      )) ?? undefined;

    const durationMin = await this.getOrderDurationMinutes(orderId);
    const anchor = order.scheduledStartAt ?? new Date();
    const dayStart = new Date(anchor);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(anchor);
    dayEnd.setHours(23, 59, 59, 999);

    const [schedule] = await this.databaseService.db
      .select({
        startTime: workSchedules.startTime,
        endTime: workSchedules.endTime,
      })
      .from(workSchedules)
      .where(
        and(
          eq(workSchedules.employeeId, employeeId),
          eq(workSchedules.isAvailable, true),
          lte(workSchedules.startTime, dayEnd),
          gte(workSchedules.endTime, dayStart),
        ),
      )
      .limit(1);

    const shiftStart = schedule?.startTime ?? this.dayAt(anchor, 8);
    const shiftEnd = schedule?.endTime ?? this.dayAt(anchor, 20);

    const busy = await this.loadEmployeeBusyIntervals(
      [employeeId],
      dayStart,
      dayEnd,
      orderId,
    );

    let slotStart: Date | null = null;

    if (order.scheduledStartAt) {
      const candidateEnd = new Date(
        order.scheduledStartAt.getTime() + durationMin * 60 * 1000,
      );
      const overlaps = (busy[employeeId] ?? []).some(
        i => order.scheduledStartAt! < i.end && candidateEnd > i.start,
      );
      if (
        !overlaps &&
        order.scheduledStartAt >= shiftStart &&
        candidateEnd <= shiftEnd
      ) {
        slotStart = order.scheduledStartAt;
      }
    }

    if (!slotStart) {
      slotStart = this.findNextFreeSlot(
        busy[employeeId] ?? [],
        shiftStart,
        shiftEnd,
        durationMin,
        order.scheduledStartAt ?? shiftStart,
      );
    }

    if (!slotStart) {
      throw new Error('No free slot for this employee on the selected day');
    }

    await this.databaseService.db
      .update(orders)
      .set({
        employeeId,
        scheduledStartAt: slotStart,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    this.gateway.notifyOrderUpdated(order.userId, orderId, order.status ?? 'pending');
    this.logger.log(`Order ${orderId} manually reassigned to employee ${employeeId}`);
    return { warning };
  }

  private dayAt(base: Date, hour: number, minute = 0): Date {
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  private dedupeEmployeesBySchedule<T extends { id: string; startTime: Date; endTime: Date }>(
    rows: T[],
  ): T[] {
    const byId = new Map<string, T>();
    for (const row of rows) {
      const existing = byId.get(row.id);
      if (!existing) {
        byId.set(row.id, row);
        continue;
      }
      const rowSpan =
        (row.endTime?.getTime() ?? 0) - (row.startTime?.getTime() ?? 0);
      const existingSpan =
        (existing.endTime?.getTime() ?? 0) - (existing.startTime?.getTime() ?? 0);
      if (rowSpan > existingSpan) {
        byId.set(row.id, row);
      }
    }
    return [...byId.values()];
  }

  private async getOrderDurationMinutes(orderId: string): Promise<number> {
    const orderServices = await this.databaseService.db
      .select({ durationMinutes: services.durationMinutes })
      .from(servicesOrders)
      .leftJoin(services, eq(servicesOrders.servicesId, services.id))
      .where(eq(servicesOrders.orderId, orderId));

    return orderServices.reduce(
      (sum, s) => sum + (Number(s.durationMinutes) || 60),
      0,
    );
  }

  private async loadEmployeeBusyIntervals(
    employeeIds: string[],
    windowStart: Date,
    windowEnd: Date,
    excludeOrderId?: string,
  ): Promise<Record<string, Array<{ start: Date; end: Date }>>> {
    const result: Record<string, Array<{ start: Date; end: Date }>> = {};
    for (const empId of employeeIds) {
      result[empId] = [];
    }

    if (employeeIds.length === 0) {
      return result;
    }

    const assignedOrders = await this.databaseService.db
      .select({
        id: orders.id,
        employeeId: orders.employeeId,
        scheduledStartAt: orders.scheduledStartAt,
      })
      .from(orders)
      .where(
        and(
          isNotNull(orders.employeeId),
          isNotNull(orders.scheduledStartAt),
          gte(orders.scheduledStartAt, windowStart),
          lte(orders.scheduledStartAt, windowEnd),
        ),
      );

    for (const row of assignedOrders) {
      if (!row.employeeId || !row.scheduledStartAt) continue;
      if (excludeOrderId && row.id === excludeOrderId) continue;
      if (!result[row.employeeId]) continue;

      const durationMin = await this.getOrderDurationMinutes(row.id);
      const start = row.scheduledStartAt;
      const end = new Date(start.getTime() + durationMin * 60 * 1000);
      result[row.employeeId].push({ start, end });
    }

    for (const empId of employeeIds) {
      result[empId].sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    return result;
  }

  private findNextFreeSlot(
    busyIntervals: Array<{ start: Date; end: Date }>,
    shiftStart: Date,
    shiftEnd: Date,
    durationMin: number,
    earliestStart: Date,
  ): Date | null {
    const durationMs = durationMin * 60 * 1000;
    let cursor = new Date(Math.max(earliestStart.getTime(), shiftStart.getTime()));

    const sorted = [...busyIntervals]
      .filter(i => i.end > cursor && i.start < shiftEnd)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    for (const interval of sorted) {
      const slotEnd = new Date(cursor.getTime() + durationMs);
      if (slotEnd <= interval.start && slotEnd <= shiftEnd) {
        return cursor;
      }
      if (interval.end > cursor) {
        cursor = new Date(interval.end.getTime());
      }
    }

    const finalEnd = new Date(cursor.getTime() + durationMs);
    return finalEnd <= shiftEnd ? cursor : null;
  }
}
