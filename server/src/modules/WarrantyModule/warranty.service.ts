import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { DatabaseService } from '../database/database.service';
import { warranties, warrantyClaims, orders, users, cars } from '../database/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

@Injectable()
export class WarrantyService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: {
    orderId: string;
    sparePartId?: string;
    type: 'work' | 'spare_part' | 'complex';
    description?: string;
    durationMonths: number;
  }) {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt);
    expiresAt.setMonth(expiresAt.getMonth() + data.durationMonths);

    const [created] = await this.databaseService.db
      .insert(warranties)
      .values({ ...data, issuedAt, expiresAt })
      .returning();
    return created;
  }

  async findByOrder(orderId: string) {
    return this.databaseService.db
      .select()
      .from(warranties)
      .where(eq(warranties.orderId, orderId));
  }

  async findById(id: string) {
    const [warranty] = await this.databaseService.db
      .select()
      .from(warranties)
      .where(eq(warranties.id, id))
      .limit(1);

    if (!warranty) throw new NotFoundException(`Warranty ${id} not found`);
    return warranty;
  }

  async findActive() {
    return this.databaseService.db
      .select()
      .from(warranties)
      .where(
        and(
          eq(warranties.status, 'active'),
          gte(warranties.expiresAt, new Date()),
        ),
      )
      .orderBy(warranties.expiresAt);
  }

  async updateStatus(
    id: string,
    status: 'active' | 'expired' | 'claimed' | 'voided',
  ) {
    const [updated] = await this.databaseService.db
      .update(warranties)
      .set({ status })
      .where(eq(warranties.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Warranty ${id} not found`);
    return updated;
  }

  // Warranty Claims
  async createClaim(data: {
    warrantyId: string;
    userId: string;
    description: string;
  }) {
    const warranty = await this.findById(data.warrantyId);

    if (warranty.status !== 'active') {
      throw new BadRequestException(
        `Warranty is ${warranty.status}, cannot file a claim`,
      );
    }

    if (warranty.expiresAt < new Date()) {
      throw new BadRequestException('Warranty has expired');
    }

    const [claim] = await this.databaseService.db
      .insert(warrantyClaims)
      .values(data)
      .returning();
    return claim;
  }

  async updateClaimStatus(
    claimId: string,
    status: 'under_review' | 'approved' | 'rejected' | 'resolved',
    resolution?: string,
  ) {
    const [updated] = await this.databaseService.db
      .update(warrantyClaims)
      .set({
        status,
        resolution,
        resolvedAt: ['approved', 'rejected', 'resolved'].includes(status)
          ? new Date()
          : undefined,
      })
      .where(eq(warrantyClaims.id, claimId))
      .returning();

    if (!updated) throw new NotFoundException(`Claim ${claimId} not found`);
    return updated;
  }

  async getClaims(warrantyId?: string) {
    const query = this.databaseService.db.select().from(warrantyClaims).$dynamic();
    if (warrantyId) {
      query.where(eq(warrantyClaims.warrantyId, warrantyId));
    }
    return query.orderBy(desc(warrantyClaims.createdAt));
  }

  async getUserClaims(userId: string) {
    return this.databaseService.db
      .select()
      .from(warrantyClaims)
      .where(eq(warrantyClaims.userId, userId))
      .orderBy(desc(warrantyClaims.createdAt));
  }

  async generateCertificatePdf(warrantyId: string): Promise<Buffer> {
    const warranty = await this.findById(warrantyId);

    // Fetch order + client + car info
    const [orderData] = await this.databaseService.db
      .select({
        clientName: users.name,
        clientSurName: users.surName,
        clientPhone: users.phone,
        clientEmail: users.email,
        carBrand: cars.brand,
        carModel: cars.model,
        carYear: cars.year,
        carVin: cars.vin,
        licensePlate: cars.licensePlate,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(cars, eq(orders.carId, cars.id))
      .where(eq(orders.id, warranty.orderId))
      .limit(1);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('ГАРАНТИЙНЫЙ ТАЛОН', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica').text(`№ ${warrantyId.slice(0, 8).toUpperCase()}`, { align: 'center' });
      doc.moveDown(1.5);

      // Warranty info
      const row = (label: string, value: string) => {
        doc.fontSize(10).font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value);
      };

      row('Дата выдачи', warranty.issuedAt.toLocaleDateString('ru-RU'));
      row('Действует до', warranty.expiresAt.toLocaleDateString('ru-RU'));
      row('Тип гарантии', warranty.type === 'work' ? 'Работы' : warranty.type === 'spare_part' ? 'Запчасти' : 'Комплексная');
      row('Статус', warranty.status === 'active' ? 'Активна' : warranty.status);

      if (warranty.description) {
        row('Описание', warranty.description);
      }

      doc.moveDown(1);

      if (orderData) {
        doc.fontSize(12).font('Helvetica-Bold').text('Клиент и автомобиль');
        doc.moveDown(0.3);
        row('Клиент', `${orderData.clientName ?? ''} ${orderData.clientSurName ?? ''}`.trim());
        if (orderData.clientPhone) row('Телефон', orderData.clientPhone);
        if (orderData.clientEmail) row('Email', orderData.clientEmail);
        doc.moveDown(0.5);
        row('Автомобиль', `${orderData.carBrand ?? ''} ${orderData.carModel ?? ''} ${orderData.carYear ?? ''}`.trim());
        if (orderData.carVin) row('VIN', orderData.carVin);
        if (orderData.licensePlate) row('Гос. номер', orderData.licensePlate);
      }

      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica').fillColor('gray')
        .text(
          'Гарантия действительна при соблюдении условий эксплуатации и прохождении планового технического обслуживания в нашем сервисном центре.',
          { align: 'justify' },
        );

      doc.moveDown(2);
      doc.fontSize(10).fillColor('black');
      doc.text('Подпись уполномоченного лица: ________________________', { align: 'left' });
      doc.moveDown(0.5);
      doc.text('М.П.', { align: 'left' });

      doc.end();
    });
  }
}
