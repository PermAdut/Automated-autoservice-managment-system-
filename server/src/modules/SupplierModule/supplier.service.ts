import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SupplierResponseDto } from './Dto/SupplierResponseDto';
import { InvoiceResponseDto } from './Dto/invoice-response.dto';
import { plainToInstance } from 'class-transformer';
import { suppliers, positionsForBuying, invoices } from '../database/schema';
import { eq, ilike, desc, asc, or, sql } from 'drizzle-orm';
import { CreateSupplierDto } from './Dto/create-supplier.dto';
import { UpdateSupplierDto } from './Dto/update-supplier.dto';
import { CreateInvoiceDto } from './Dto/create-invoice.dto';
import { UpdateInvoiceDto } from './Dto/update-invoice.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy: 'name' | 'id' | undefined = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<SupplierResponseDto[]> {
    try {
      let baseQuery = this.databaseService.db.select().from(suppliers);

      if (search) {
        baseQuery = baseQuery.where(
          or(
            ilike(suppliers.name, `%${search}%`),
            suppliers.contact
              ? ilike(suppliers.contact, `%${search}%`)
              : sql`FALSE`,
            suppliers.address
              ? ilike(suppliers.address, `%${search}%`)
              : sql`FALSE`,
            sql`CAST(${suppliers.id} AS TEXT) LIKE ${`%${search}%`}`
          )
        ) as typeof baseQuery;
      }

      if (sortBy === 'name') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        baseQuery = baseQuery.orderBy(
          orderBy(suppliers.name)
        ) as typeof baseQuery;
      } else if (sortBy === 'id') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        baseQuery = baseQuery.orderBy(
          orderBy(suppliers.id)
        ) as typeof baseQuery;
      }

      const suppliersList = await baseQuery;

      const suppliersResponse: SupplierResponseDto[] = await Promise.all(
        suppliersList.map(async supplier => {
          const positions = await this.databaseService.db
            .select()
            .from(positionsForBuying)
            .where(eq(positionsForBuying.supplierId, supplier.id));

          return {
            id: supplier.id,
            name: supplier.name,
            contact: supplier.contact || '',
            address: supplier.address || '',
            positionsForBuying: positions.map(p => ({
              id: p.id,
              quantity: p.quantity,
              deliverDate: p.deliveryDate.toISOString(),
              status: p.status,
            })),
          };
        })
      );

      return plainToInstance(SupplierResponseDto, suppliersResponse, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new BadRequestException('Failed to fetch suppliers');
    }
  }

  async findById(id: string): Promise<SupplierResponseDto> {
    const [supplier] = await this.databaseService.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    const positions = await this.databaseService.db
      .select()
      .from(positionsForBuying)
      .where(eq(positionsForBuying.supplierId, supplier.id));

    return {
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact || '',
      address: supplier.address || '',
      positionsForBuying: positions.map(p => ({
        id: p.id,
        quantity: p.quantity,
        deliverDate: p.deliveryDate.toISOString(),
        status: p.status,
      })),
    };
  }

  async create(supplierData: CreateSupplierDto): Promise<SupplierResponseDto> {
    const [newSupplier] = await this.databaseService.db
      .insert(suppliers)
      .values({
        name: supplierData.name,
        contact: supplierData.contact,
        address: supplierData.address,
      })
      .returning();

    return this.findById(newSupplier.id);
  }

  async update(
    id: string,
    supplierData: UpdateSupplierDto
  ): Promise<SupplierResponseDto> {
    const updatePayload: Partial<typeof suppliers.$inferInsert> = {};

    if (supplierData.name !== undefined) {
      updatePayload.name = supplierData.name;
    }

    if (supplierData.contact !== undefined) {
      updatePayload.contact = supplierData.contact;
    }

    if (supplierData.address !== undefined) {
      updatePayload.address = supplierData.address;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('No supplier fields provided for update');
    }

    const [updatedSupplier] = await this.databaseService.db
      .update(suppliers)
      .set(updatePayload)
      .where(eq(suppliers.id, id))
      .returning();

    if (!updatedSupplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const supplier = await this.databaseService.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (supplier.length === 0) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    await this.databaseService.db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async getInvoicesByPosition(positionId: string): Promise<InvoiceResponseDto[]> {
    const position = await this.databaseService.db
      .select()
      .from(positionsForBuying)
      .where(eq(positionsForBuying.id, positionId))
      .limit(1);

    if (!position.length) {
      throw new NotFoundException(`Position with id ${positionId} not found`);
    }

    const rows = await this.databaseService.db
      .select()
      .from(invoices)
      .where(eq(invoices.positionForBuyingId, positionId))
      .orderBy(desc(invoices.invoiceDate));

    return plainToInstance(
      InvoiceResponseDto,
      rows.map(r => ({ ...r, invoiceDate: r.invoiceDate.toISOString() })),
      { excludeExtraneousValues: true }
    );
  }

  async getInvoiceById(id: string): Promise<InvoiceResponseDto> {
    const [invoice] = await this.databaseService.db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return plainToInstance(
      InvoiceResponseDto,
      { ...invoice, invoiceDate: invoice.invoiceDate.toISOString() },
      { excludeExtraneousValues: true }
    );
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const position = await this.databaseService.db
      .select()
      .from(positionsForBuying)
      .where(eq(positionsForBuying.id, dto.positionForBuyingId))
      .limit(1);

    if (!position.length) {
      throw new NotFoundException(`Position with id ${dto.positionForBuyingId} not found`);
    }

    const [created] = await this.databaseService.db
      .insert(invoices)
      .values({
        positionForBuyingId: dto.positionForBuyingId,
        amount: String(dto.amount),
        status: dto.status,
      })
      .returning();

    return this.getInvoiceById(created.id);
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const updatePayload: Partial<typeof invoices.$inferInsert> = {};

    if (dto.amount !== undefined) updatePayload.amount = String(dto.amount);
    if (dto.status !== undefined) updatePayload.status = dto.status;

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('No invoice fields provided for update');
    }

    const [updated] = await this.databaseService.db
      .update(invoices)
      .set(updatePayload)
      .where(eq(invoices.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return this.getInvoiceById(id);
  }

  async deleteInvoice(id: string): Promise<void> {
    const [existing] = await this.databaseService.db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    await this.databaseService.db.delete(invoices).where(eq(invoices.id, id));
  }
}
