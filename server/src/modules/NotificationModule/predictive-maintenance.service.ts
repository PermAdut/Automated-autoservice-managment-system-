import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import {
  cars,
  users,
  maintenanceReminders,
  diagnosticSessions,
  tenantSettings,
} from '../database/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { NotificationQueueService } from '../QueueModule/services/notification-queue.service';

/**
 * FT-9: Predictive Maintenance Algorithm
 *
 * Runs nightly at 02:00. For each car:
 *   1. Calculates average monthly mileage from the last 3 diagnostic sessions.
 *   2. Forecasts when the car will reach each service interval.
 *   3. Creates a maintenanceReminder when < 10% of the interval remains.
 *
 * Service norms (km / months) are defined as constants below.
 * An admin can extend this with a DB table in the future.
 */

interface ServiceNorm {
  type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'scheduled_maintenance' | 'timing_belt';
  label: string;
  intervalKm: number;
  intervalMonths: number;
}

const SERVICE_NORMS: ServiceNorm[] = [
  { type: 'oil_change', label: 'Замена масла', intervalKm: 10000, intervalMonths: 12 },
  { type: 'tire_rotation', label: 'Ротация шин', intervalKm: 15000, intervalMonths: 6 },
  { type: 'brake_service', label: 'Обслуживание тормозов', intervalKm: 30000, intervalMonths: 24 },
  { type: 'scheduled_maintenance', label: 'Плановое ТО', intervalKm: 20000, intervalMonths: 12 },
  { type: 'timing_belt', label: 'Замена ремня ГРМ', intervalKm: 90000, intervalMonths: 60 },
];

const THRESHOLD = 0.10; // notify when < 10% of interval remains

@Injectable()
export class PredictiveMaintenanceService {
  private readonly logger = new Logger(PredictiveMaintenanceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  /** Nightly at 02:00 */
  @Cron('0 2 * * *')
  async runPredictiveCheck() {
    this.logger.log('Starting predictive maintenance check...');

    const [tenant] = await this.databaseService.db
      .select({ companyName: tenantSettings.companyName, phone: tenantSettings.phone })
      .from(tenantSettings)
      .limit(1);

    const companyName = tenant?.companyName || 'АвтоСервис';
    const companyPhone = tenant?.phone || undefined;

    // Load all cars with their owner info
    const allCars = await this.databaseService.db
      .select({
        carId: cars.id,
        userId: cars.userId,
        brand: cars.brand,
        model: cars.model,
        year: cars.year,
        userEmail: users.email,
        userPhone: users.phone,
        userName: users.name,
      })
      .from(cars)
      .leftJoin(users, eq(cars.userId, users.id));

    let created = 0;

    for (const car of allCars) {
      try {
        await this.processCarPrediction(car, companyName, companyPhone);
        created++;
      } catch (err) {
        this.logger.error(`Failed to process car ${car.carId}: ${err}`);
      }
    }

    this.logger.log(`Predictive maintenance check complete. Processed ${created}/${allCars.length} cars.`);
  }

  private async processCarPrediction(
    car: {
      carId: string;
      userId: string;
      brand: string | null;
      model: string | null;
      year: number | null;
      userEmail: string | null;
      userPhone: string | null;
      userName: string | null;
    },
    companyName: string,
    companyPhone: string | undefined,
  ) {
    // Get last 3 diagnostic sessions with mileage data, ordered by date
    const sessions = await this.databaseService.db
      .select({
        mileage: diagnosticSessions.mileage,
        createdAt: diagnosticSessions.createdAt,
      })
      .from(diagnosticSessions)
      .where(
        and(
          eq(diagnosticSessions.carId, car.carId),
          sql`${diagnosticSessions.mileage} IS NOT NULL`,
        ),
      )
      .orderBy(desc(diagnosticSessions.createdAt))
      .limit(3);

    if (sessions.length < 2) return; // need at least 2 points for a slope

    // Calculate average monthly mileage
    const newest = sessions[0];
    const oldest = sessions[sessions.length - 1];
    const mileageDiff = (newest.mileage ?? 0) - (oldest.mileage ?? 0);
    const monthsDiff = Math.max(
      0.5,
      (newest.createdAt.getTime() - oldest.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    const avgKmPerMonth = mileageDiff / monthsDiff;

    const currentMileage = newest.mileage ?? 0;
    const now = new Date();

    for (const norm of SERVICE_NORMS) {
      // Find last completed reminder of this type to know the baseline
      const lastCompleted = await this.databaseService.db
        .select({ createdAt: maintenanceReminders.createdAt, dueMileage: maintenanceReminders.dueMileage })
        .from(maintenanceReminders)
        .where(
          and(
            eq(maintenanceReminders.carId, car.carId),
            eq(maintenanceReminders.type, norm.type),
            eq(maintenanceReminders.isCompleted, true),
          ),
        )
        .orderBy(desc(maintenanceReminders.createdAt))
        .limit(1);

      const lastMileage = lastCompleted[0]?.dueMileage ?? 0;
      const lastDate = lastCompleted[0]?.createdAt ?? new Date(now.getFullYear() - 1, 0, 1);

      const nextDueMileage = lastMileage + norm.intervalKm;
      const nextDueDate = new Date(lastDate.getTime() + norm.intervalMonths * 30 * 24 * 60 * 60 * 1000);

      const kmRemaining = nextDueMileage - currentMileage;
      const daysRemaining = (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      const kmThreshold = norm.intervalKm * THRESHOLD;
      const daysThreshold = norm.intervalMonths * 30 * THRESHOLD;

      const needsByMileage = kmRemaining > 0 && kmRemaining <= kmThreshold;
      const needsByDate = daysRemaining > 0 && daysRemaining <= daysThreshold;

      if (!needsByMileage && !needsByDate) continue;

      // Check if a pending reminder of this type already exists (prevent duplicates)
      const existing = await this.databaseService.db
        .select({ id: maintenanceReminders.id })
        .from(maintenanceReminders)
        .where(
          and(
            eq(maintenanceReminders.carId, car.carId),
            eq(maintenanceReminders.type, norm.type),
            eq(maintenanceReminders.isCompleted, false),
            eq(maintenanceReminders.isSent, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) continue;

      // Create the reminder
      const [reminder] = await this.databaseService.db
        .insert(maintenanceReminders)
        .values({
          userId: car.userId,
          carId: car.carId,
          type: norm.type,
          description: this.buildDescription(norm, needsByMileage, needsByDate, kmRemaining, daysRemaining),
          dueDate: needsByDate ? nextDueDate : undefined,
          dueMileage: needsByMileage ? nextDueMileage : undefined,
        })
        .returning();

      const carInfo = [car.brand, car.model, car.year].filter(Boolean).join(' ');

      // Enqueue notification
      await this.notificationQueue.addMaintenanceReminderJob({
        reminderId: reminder.id,
        userId: car.userId,
        carInfo,
        type: norm.type,
        dueDate: needsByDate ? nextDueDate.toLocaleDateString('ru-RU') : undefined,
        dueMileage: needsByMileage ? nextDueMileage : undefined,
        userPhone: car.userPhone ?? undefined,
        userEmail: car.userEmail ?? undefined,
        userName: car.userName ?? undefined,
        companyName,
        companyPhone,
      });

      this.logger.debug(`Created ${norm.type} reminder for car ${car.carId}`);
    }
  }

  private buildDescription(
    norm: ServiceNorm,
    byMileage: boolean,
    byDate: boolean,
    kmLeft: number,
    daysLeft: number,
  ): string {
    const parts: string[] = [`${norm.label}:`];
    if (byMileage) parts.push(`осталось ~${Math.round(kmLeft)} км`);
    if (byDate) parts.push(`осталось ~${Math.round(daysLeft)} дней`);
    return parts.join(' ');
  }
}
