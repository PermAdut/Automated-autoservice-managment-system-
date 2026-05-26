import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { DatabaseService } from '../database/database.service';
import { PDF_FONT_BOLD, PDF_FONT_REGULAR, registerPdfFonts } from '../../utils/pdfFonts';
import {
  companies,
  companyContracts,
  companyCars,
  companyDrivers,
  orders,
  payments,
  users,
  cars,
} from '../database/schema';
import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm';

@Injectable()
export class CorporateService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.db
      .select()
      .from(companies)
      .orderBy(companies.name);
  }

  async findById(id: string) {
    const [company] = await this.databaseService.db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }

  async create(data: {
    name: string;
    inn?: string;
    address?: string;
    city?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    managerUserId?: string;
    bankAccount?: string;
    bic?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(companies)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      inn: string;
      address: string;
      city: string;
      contactPerson: string;
      phone: string;
      email: string;
      managerUserId: string;
      bankAccount: string;
      bic: string;
      isActive: boolean;
    }>,
  ) {
    const [updated] = await this.databaseService.db
      .update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Company ${id} not found`);
    return updated;
  }

  async getContracts(companyId: string) {
    return this.databaseService.db
      .select()
      .from(companyContracts)
      .where(eq(companyContracts.companyId, companyId))
      .orderBy(desc(companyContracts.createdAt));
  }

  async createContract(data: {
    companyId: string;
    contractNumber?: string;
    discountPercent?: string;
    creditLimit?: string;
    paymentTermDays?: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(companyContracts)
      .values({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      })
      .returning();
    return created;
  }

  async updateContractStatus(
    contractId: string,
    status: 'draft' | 'active' | 'suspended' | 'expired' | 'terminated',
  ) {
    const [updated] = await this.databaseService.db
      .update(companyContracts)
      .set({ status })
      .where(eq(companyContracts.id, contractId))
      .returning();

    if (!updated)
      throw new NotFoundException(`Contract ${contractId} not found`);
    return updated;
  }

  async addCar(companyId: string, carId: string, notes?: string) {
    const [created] = await this.databaseService.db
      .insert(companyCars)
      .values({ companyId, carId, notes })
      .onConflictDoNothing()
      .returning();
    return created;
  }

  async removeCar(companyId: string, carId: string) {
    await this.databaseService.db
      .delete(companyCars)
      .where(
        and(eq(companyCars.companyId, companyId), eq(companyCars.carId, carId)),
      );
  }

  async getCompanyCars(companyId: string) {
    return this.databaseService.db
      .select()
      .from(companyCars)
      .where(eq(companyCars.companyId, companyId));
  }

  async getDrivers(companyId: string) {
    return this.databaseService.db
      .select({
        companyId: companyDrivers.companyId,
        userId: companyDrivers.userId,
        name: users.name,
        surName: users.surName,
        email: users.email,
        phone: users.phone,
      })
      .from(companyDrivers)
      .innerJoin(users, eq(companyDrivers.userId, users.id))
      .where(eq(companyDrivers.companyId, companyId));
  }

  async addDriver(companyId: string, userId: string) {
    await this.findById(companyId);
    const [created] = await this.databaseService.db
      .insert(companyDrivers)
      .values({ companyId, userId })
      .onConflictDoNothing()
      .returning();
    return created ?? { companyId, userId };
  }

  async removeDriver(companyId: string, userId: string) {
    await this.databaseService.db
      .delete(companyDrivers)
      .where(
        and(
          eq(companyDrivers.companyId, companyId),
          eq(companyDrivers.userId, userId),
        ),
      );
  }

  async getActiveContract(companyId: string) {
    const now = new Date();
    const [contract] = await this.databaseService.db
      .select()
      .from(companyContracts)
      .where(
        and(
          eq(companyContracts.companyId, companyId),
          eq(companyContracts.status, 'active'),
          lte(companyContracts.startDate, now),
          gte(companyContracts.endDate, now),
        ),
      )
      .orderBy(desc(companyContracts.createdAt))
      .limit(1);
    return contract ?? null;
  }

  async getCompanyByCarId(carId: string) {
    const [row] = await this.databaseService.db
      .select({ companyId: companyCars.companyId })
      .from(companyCars)
      .where(eq(companyCars.carId, carId))
      .limit(1);
    if (!row) return null;
    return this.findById(row.companyId);
  }

  async getCompanySpend(companyId: string, from?: Date, to?: Date) {
    const carRows = await this.databaseService.db
      .select({ carId: companyCars.carId })
      .from(companyCars)
      .where(eq(companyCars.companyId, companyId));

    if (!carRows.length) return 0;

    const carIds = carRows.map(r => r.carId);
    const orderRows = await this.databaseService.db
      .select({ id: orders.id })
      .from(orders)
      .where(inArray(orders.carId, carIds));

    if (!orderRows.length) return 0;

    const orderIds = orderRows.map(o => o.id);
    const conditions = [
      inArray(payments.orderId, orderIds),
      eq(payments.status, 'paid'),
    ];
    if (from) conditions.push(gte(payments.paymentDate, from));
    if (to) conditions.push(lte(payments.paymentDate, to));

    const [result] = await this.databaseService.db
      .select({
        total: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)`,
      })
      .from(payments)
      .where(and(...conditions));

    return parseFloat(String(result?.total ?? 0));
  }

  async checkCreditLimitAlert(
    carId: string,
    additionalAmount = 0,
  ): Promise<{
    alert: boolean;
    companyId?: string;
    companyName?: string;
    managerUserId?: string | null;
    spent?: number;
    limit?: number;
    percent?: number;
  } | null> {
    const [link] = await this.databaseService.db
      .select({ companyId: companyCars.companyId })
      .from(companyCars)
      .where(eq(companyCars.carId, carId))
      .limit(1);

    if (!link) return null;

    const company = await this.findById(link.companyId);
    const contract = await this.getActiveContract(link.companyId);
    if (!contract?.creditLimit) return null;

    const limit = parseFloat(String(contract.creditLimit));
    const spent = (await this.getCompanySpend(link.companyId)) + additionalAmount;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;

    return {
      alert: percent >= 80,
      companyId: company.id,
      companyName: company.name,
      managerUserId: company.managerUserId,
      spent,
      limit,
      percent: Math.round(percent),
    };
  }

  async getMonthlyActData(companyId: string, year: number, month: number) {
    const company = await this.findById(companyId);
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59);

    const carRows = await this.databaseService.db
      .select({ carId: companyCars.carId })
      .from(companyCars)
      .where(eq(companyCars.companyId, companyId));

    const carIds = carRows.map(r => r.carId);
    if (!carIds.length) {
      return { company, orders: [], total: 0, period: { from, to } };
    }

    const orderRows = await this.databaseService.db
      .select({
        orderId: orders.id,
        createdAt: orders.createdAt,
        status: orders.status,
        amount: payments.amount,
        brand: cars.brand,
        model: cars.model,
        licensePlate: cars.licensePlate,
      })
      .from(orders)
      .innerJoin(payments, eq(payments.orderId, orders.id))
      .leftJoin(cars, eq(cars.id, orders.carId))
      .where(
        and(
          inArray(orders.carId, carIds),
          eq(payments.status, 'paid'),
          gte(payments.paymentDate, from),
          lte(payments.paymentDate, to),
        ),
      )
      .orderBy(orders.createdAt);

    const total = orderRows.reduce(
      (sum, r) => sum + parseFloat(String(r.amount ?? 0)),
      0,
    );

    return { company, orders: orderRows, total, period: { from, to } };
  }

  async generateMonthlyActPdf(
    companyId: string,
    year: number,
    month: number,
  ): Promise<Buffer> {
    const data = await this.getMonthlyActData(companyId, year, month);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      registerPdfFonts(doc);

      const monthLabel = new Date(year, month - 1).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      });

      doc.fontSize(16).font(PDF_FONT_BOLD).text('Акт выполненных работ', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).font(PDF_FONT_REGULAR).text(`Период: ${monthLabel}`, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).font(PDF_FONT_BOLD).text(data.company.name);
      if (data.company.inn) doc.font(PDF_FONT_REGULAR).text(`ИНН: ${data.company.inn}`);
      if (data.company.bankAccount) doc.text(`Р/с: ${data.company.bankAccount}`);
      if (data.company.bic) doc.text(`БИК: ${data.company.bic}`);
      doc.moveDown(1);

      doc.fontSize(10).font(PDF_FONT_BOLD);
      doc.text('№', 40, doc.y, { continued: true, width: 30 });
      doc.text('Дата', { continued: true, width: 80 });
      doc.text('Автомобиль', { continued: true, width: 150 });
      doc.text('Сумма, BYN', { align: 'right' });
      doc.moveDown(0.3);
      doc.font(PDF_FONT_REGULAR);

      data.orders.forEach((row, i) => {
        const carLabel = [row.brand, row.model, row.licensePlate].filter(Boolean).join(' ');
        doc.text(String(i + 1), 40, doc.y, { continued: true, width: 30 });
        doc.text(row.createdAt?.toLocaleDateString('ru-RU') ?? '—', { continued: true, width: 80 });
        doc.text(carLabel || '—', { continued: true, width: 150 });
        doc.text(parseFloat(String(row.amount ?? 0)).toFixed(2), { align: 'right' });
      });

      doc.moveDown(1);
      doc.font(PDF_FONT_BOLD).text(`Итого: ${data.total.toFixed(2)} BYN`, { align: 'right' });
      doc.end();
    });
  }
}
