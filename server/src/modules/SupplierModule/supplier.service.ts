import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SupplierResponseDto } from './Dto/SupplierResponseDto';
import { plainToInstance } from 'class-transformer';
import { suppliers, positionsForBuying } from '../database/schema';
import { eq, ilike, desc, asc, or, sql } from 'drizzle-orm';
import { CreateSupplierDto } from './Dto/create-supplier.dto';
import { UpdateSupplierDto } from './Dto/update-supplier.dto';

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

  async findById(id: number): Promise<SupplierResponseDto> {
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
    id: number,
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

  async delete(id: number): Promise<void> {
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
}
