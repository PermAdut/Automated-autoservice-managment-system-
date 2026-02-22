import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  diagnosticCodesCatalog,
  diagnosticSessions,
  diagnosticResults,
  maintenanceReminders,
} from '../database/schema';
import { eq, and, desc, like } from 'drizzle-orm';

@Injectable()
export class DiagnosticsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // DTC Catalog
  async searchDtcCodes(query?: string) {
    if (query) {
      return this.databaseService.db
        .select()
        .from(diagnosticCodesCatalog)
        .where(like(diagnosticCodesCatalog.code, `${query.toUpperCase()}%`))
        .limit(50);
    }
    return this.databaseService.db
      .select()
      .from(diagnosticCodesCatalog)
      .limit(100);
  }

  async getDtcCode(code: string) {
    const [entry] = await this.databaseService.db
      .select()
      .from(diagnosticCodesCatalog)
      .where(eq(diagnosticCodesCatalog.code, code.toUpperCase()))
      .limit(1);

    if (!entry) throw new NotFoundException(`DTC code ${code} not found`);
    return entry;
  }

  async createDtcCode(data: {
    code: string;
    description: string;
    descriptionRu?: string;
    severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
    system?: string;
    possibleCauses?: string;
    possibleFixes?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(diagnosticCodesCatalog)
      .values({ ...data, code: data.code.toUpperCase() })
      .returning();
    return created;
  }

  // Diagnostic Sessions
  async createSession(data: {
    carId: string;
    employeeId?: string;
    orderId?: string;
    mileage?: number;
    notes?: string;
    rawData?: string;
    codes?: { codeId: string; notes?: string }[];
  }) {
    const { codes, ...sessionData } = data;

    const [session] = await this.databaseService.db
      .insert(diagnosticSessions)
      .values(sessionData)
      .returning();

    if (codes?.length) {
      await this.databaseService.db.insert(diagnosticResults).values(
        codes.map(c => ({
          sessionId: session.id,
          codeId: c.codeId,
          notes: c.notes,
        })),
      );
    }

    return session;
  }

  async getSessionsBycar(carId: string) {
    return this.databaseService.db
      .select()
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.carId, carId))
      .orderBy(desc(diagnosticSessions.createdAt));
  }

  async getSession(id: string) {
    const [session] = await this.databaseService.db
      .select()
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.id, id))
      .limit(1);

    if (!session) throw new NotFoundException(`Session ${id} not found`);

    const results = await this.databaseService.db
      .select({
        codeId: diagnosticResults.codeId,
        status: diagnosticResults.status,
        notes: diagnosticResults.notes,
        code: diagnosticCodesCatalog.code,
        description: diagnosticCodesCatalog.description,
        severity: diagnosticCodesCatalog.severity,
      })
      .from(diagnosticResults)
      .leftJoin(
        diagnosticCodesCatalog,
        eq(diagnosticResults.codeId, diagnosticCodesCatalog.id),
      )
      .where(eq(diagnosticResults.sessionId, id));

    return { ...session, results };
  }

  // Maintenance Reminders
  async getReminders(userId: string, carId?: string) {
    const conditions = [eq(maintenanceReminders.userId, userId)];
    if (carId) conditions.push(eq(maintenanceReminders.carId, carId));

    return this.databaseService.db
      .select()
      .from(maintenanceReminders)
      .where(and(...conditions))
      .orderBy(maintenanceReminders.dueDate);
  }

  async createReminder(data: {
    userId: string;
    carId: string;
    type:
      | 'oil_change'
      | 'tire_rotation'
      | 'brake_service'
      | 'scheduled_maintenance'
      | 'timing_belt'
      | 'other';
    description?: string;
    dueDate?: string;
    dueMileage?: number;
  }) {
    const [created] = await this.databaseService.db
      .insert(maintenanceReminders)
      .values({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      })
      .returning();
    return created;
  }

  async completeReminder(id: string) {
    const [updated] = await this.databaseService.db
      .update(maintenanceReminders)
      .set({ isCompleted: true })
      .where(eq(maintenanceReminders.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Reminder ${id} not found`);
    return updated;
  }
}
