import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { DatabaseService } from '../database/database.service';
import { PDF_FONT_BOLD, PDF_FONT_REGULAR, registerPdfFonts } from '../../utils/pdfFonts';
import {
  diagnosticCodesCatalog,
  diagnosticSessions,
  diagnosticResults,
  maintenanceReminders,
  cars,
  employees,
} from '../database/schema';
import { eq, and, desc, like } from 'drizzle-orm';

function parseSessionMeta(rawData?: string | null): { photoUrls: string[] } {
  if (!rawData) return { photoUrls: [] };
  try {
    const parsed = JSON.parse(rawData) as { photoUrls?: string[] };
    return { photoUrls: parsed.photoUrls ?? [] };
  } catch {
    return { photoUrls: [] };
  }
}

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
    photoUrls?: string[];
    codes?: { codeId: string; notes?: string }[];
  }) {
    const { codes, photoUrls, rawData, ...sessionData } = data;
    const meta = {
      ...(rawData ? (() => { try { return JSON.parse(rawData); } catch { return {}; } })() : {}),
      ...(photoUrls?.length ? { photoUrls } : {}),
    };
    const storedRaw = Object.keys(meta).length ? JSON.stringify(meta) : rawData;

    const [session] = await this.databaseService.db
      .insert(diagnosticSessions)
      .values({ ...sessionData, rawData: storedRaw })
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
    const rows = await this.databaseService.db
      .select()
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.carId, carId))
      .orderBy(desc(diagnosticSessions.createdAt));

    return rows.map(r => ({ ...r, ...parseSessionMeta(r.rawData) }));
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

    return { ...session, ...parseSessionMeta(session.rawData), results };
  }

  async generateSessionPdf(sessionId: string): Promise<Buffer> {
    const session = await this.getSession(sessionId);
    const [car] = await this.databaseService.db
      .select()
      .from(cars)
      .where(eq(cars.id, session.carId))
      .limit(1);

    let employeeName = '';
    if (session.employeeId) {
      const [emp] = await this.databaseService.db
        .select({ name: employees.name, surName: employees.surName })
        .from(employees)
        .where(eq(employees.id, session.employeeId))
        .limit(1);
      employeeName = emp ? `${emp.surName} ${emp.name}` : '';
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      registerPdfFonts(doc);

      doc.fontSize(16).font(PDF_FONT_BOLD).text('Диагностическая карта');
      doc.moveDown(0.5);
      doc.fontSize(10).font(PDF_FONT_REGULAR);
      doc.text(`Дата: ${session.createdAt.toLocaleDateString('ru-RU')}`);
      if (car) {
        doc.text(`Автомобиль: ${car.brand} ${car.model} ${car.year ?? ''}`.trim());
        if (car.licensePlate) doc.text(`Гос. номер: ${car.licensePlate}`);
      }
      if (session.mileage) doc.text(`Пробег: ${session.mileage.toLocaleString('ru-RU')} км`);
      if (employeeName) doc.text(`Мастер: ${employeeName}`);
      doc.moveDown(1);

      if (session.notes) {
        doc.font(PDF_FONT_BOLD).text('Заметки');
        doc.font(PDF_FONT_REGULAR).text(session.notes);
        doc.moveDown(0.5);
      }

      if (session.results?.length) {
        doc.font(PDF_FONT_BOLD).text('Коды ошибок');
        session.results.forEach(r => {
          doc.font(PDF_FONT_REGULAR).text(`• ${r.code}: ${r.description ?? ''} (${r.severity ?? ''})`);
        });
        doc.moveDown(0.5);
      }

      const { photoUrls } = parseSessionMeta(session.rawData);
      if (photoUrls.length) {
        doc.font(PDF_FONT_BOLD).text('Фотографии');
        photoUrls.forEach(url => doc.font(PDF_FONT_REGULAR).text(`• ${url}`));
      }

      doc.end();
    });
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
