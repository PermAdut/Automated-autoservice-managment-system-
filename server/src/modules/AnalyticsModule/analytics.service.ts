import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  orders,
  payments,
  appointments,
  employees,
  reviews,
  users,
  spareParts,
  sparePartStore,
  loyaltyPrograms,
} from '../database/schema';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Main dashboard KPIs — for the current period vs previous.
   */
  async getDashboardKpi(period: 'today' | 'week' | 'month' | 'year' = 'month') {
    const { start, prevStart, prevEnd } = this.getPeriodBounds(period);
    const now = new Date();

    const [ordersTotal, ordersPrev] = await Promise.all([
      this.countOrders(start, now),
      this.countOrders(prevStart, prevEnd),
    ]);

    const [revenueTotal, revenuePrev] = await Promise.all([
      this.sumRevenue(start, now),
      this.sumRevenue(prevStart, prevEnd),
    ]);

    const [newUsersTotal, newUsersPrev] = await Promise.all([
      this.countNewUsers(start, now),
      this.countNewUsers(prevStart, prevEnd),
    ]);

    const [avgRating] = await this.databaseService.db
      .select({ avg: sql<number>`AVG(${reviews.rate})` })
      .from(reviews)
      .where(and(gte(reviews.createdAt, start), lte(reviews.createdAt, now)));

    return {
      period,
      orders: {
        current: ordersTotal,
        previous: ordersPrev,
        growth: this.calcGrowth(ordersTotal, ordersPrev),
      },
      revenue: {
        current: revenueTotal,
        previous: revenuePrev,
        growth: this.calcGrowth(revenueTotal, revenuePrev),
      },
      newUsers: {
        current: newUsersTotal,
        previous: newUsersPrev,
        growth: this.calcGrowth(newUsersTotal, newUsersPrev),
      },
      averageRating: avgRating?.avg ? parseFloat(String(avgRating.avg)).toFixed(1) : null,
    };
  }

  /**
   * Orders grouped by status.
   */
  async getOrdersByStatus() {
    return this.databaseService.db
      .select({
        status: orders.status,
        count: count(),
      })
      .from(orders)
      .groupBy(orders.status)
      .orderBy(desc(count()));
  }

  /**
   * Revenue by month for the last 12 months (for charts).
   */
  async getRevenueByMonth() {
    return this.databaseService.db
      .select({
        month: sql<string>`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`,
        revenue: sql<number>`SUM(${payments.amount}::numeric)`,
        count: count(),
      })
      .from(payments)
      .where(
        and(
          eq(payments.status, 'paid'),
          gte(payments.paymentDate, new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
        ),
      )
      .groupBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`);
  }

  /**
   * Top services by order count.
   */
  async getTopServices(limit = 10) {
    const { servicesOrders, services } = await import('../database/schema');
    return this.databaseService.db
      .select({
        serviceId: services.id,
        name: services.name,
        orderCount: count(),
        totalRevenue: sql<number>`SUM(${services.price}::numeric)`,
      })
      .from(servicesOrders)
      .leftJoin(services, eq(servicesOrders.servicesId, services.id))
      .groupBy(services.id, services.name)
      .orderBy(desc(count()))
      .limit(limit);
  }

  /**
   * Top employees by order count and avg rating.
   */
  async getTopEmployees(limit = 10) {
    return this.databaseService.db
      .select({
        employeeId: employees.id,
        name: employees.name,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
        avgRating: sql<number>`AVG(${reviews.rate})`,
      })
      .from(employees)
      .leftJoin(orders, eq(orders.employeeId, employees.id))
      .leftJoin(reviews, eq(reviews.employeeId, employees.id))
      .groupBy(employees.id, employees.name)
      .orderBy(desc(sql`COUNT(DISTINCT ${orders.id})`))
      .limit(limit);
  }

  /**
   * Inventory alerts — items with low stock across all stores.
   */
  async getLowStockAlerts(threshold = 5) {
    return this.databaseService.db
      .select({
        sparePartId: spareParts.id,
        name: spareParts.name,
        partNumber: spareParts.partNumber,
        totalQuantity: sql<number>`SUM(${sparePartStore.quantity})`,
      })
      .from(spareParts)
      .leftJoin(sparePartStore, eq(sparePartStore.sparePartId, spareParts.id))
      .groupBy(spareParts.id, spareParts.name, spareParts.partNumber)
      .having(sql`SUM(${sparePartStore.quantity}) <= ${threshold}`)
      .orderBy(sql`SUM(${sparePartStore.quantity})`);
  }

  /**
   * Appointments by day for the next 30 days.
   */
  async getUpcomingAppointments() {
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    return this.databaseService.db
      .select({
        day: sql<string>`DATE(${appointments.scheduledAt})`,
        count: count(),
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledAt, now),
          lte(appointments.scheduledAt, thirtyDays),
          sql`${appointments.status} NOT IN ('cancelled', 'no_show')`,
        ),
      )
      .groupBy(sql`DATE(${appointments.scheduledAt})`)
      .orderBy(sql`DATE(${appointments.scheduledAt})`);
  }

  /**
   * Loyalty program summary.
   */
  async getLoyaltySummary() {
    return this.databaseService.db
      .select({
        tier: loyaltyPrograms.tier,
        count: count(),
        totalPoints: sql<number>`SUM(${loyaltyPrograms.points})`,
      })
      .from(loyaltyPrograms)
      .groupBy(loyaltyPrograms.tier)
      .orderBy(loyaltyPrograms.tier);
  }

  // --- private helpers ---

  private getPeriodBounds(period: string) {
    const now = new Date();
    let start: Date;
    let prevStart: Date;
    let prevEnd: Date;

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prevEnd = new Date(start);
        prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - 1);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEnd = new Date(start);
        prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        prevEnd = new Date(start);
        prevStart = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default: // month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        prevEnd = new Date(start);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    return { start, prevStart, prevEnd };
  }

  private async countOrders(from: Date, to: Date): Promise<number> {
    const [result] = await this.databaseService.db
      .select({ count: count() })
      .from(orders)
      .where(and(gte(orders.createdAt, from), lte(orders.createdAt, to)));
    return result?.count ?? 0;
  }

  private async sumRevenue(from: Date, to: Date): Promise<number> {
    const [result] = await this.databaseService.db
      .select({ total: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)` })
      .from(payments)
      .where(
        and(
          eq(payments.status, 'paid'),
          gte(payments.paymentDate, from),
          lte(payments.paymentDate, to),
        ),
      );
    return parseFloat(String(result?.total ?? 0));
  }

  private async countNewUsers(from: Date, to: Date): Promise<number> {
    const [result] = await this.databaseService.db
      .select({ count: count() })
      .from(users)
      .where(and(gte(users.createdAt, from), lte(users.createdAt, to)));
    return result?.count ?? 0;
  }

  private calcGrowth(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  }
}
