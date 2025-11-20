import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SupplierResponseDto } from './Dto/SupplierResponseDto';
import { plainToInstance } from 'class-transformer';
import { suppliers, positionsForBuying } from '../database/schema';
import { eq, like, or, desc, asc } from 'drizzle-orm';

@Injectable()
export class SupplierService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<SupplierResponseDto[]> {
    try {
      let baseQuery = this.databaseService.db.select().from(suppliers);

      if (search) {
        baseQuery = baseQuery.where(
          or(
            like(suppliers.name, `%${search}%`),
            like(suppliers.contact, `%${search}%`),
            like(suppliers.address, `%${search}%`)
          )
        ) as typeof baseQuery;
      }

      if (sortBy === 'name') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        baseQuery = baseQuery.orderBy(
          orderBy(suppliers.name)
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
      .where(eq(suppliers.id, parseInt(id)))
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

  async create(supplierData: {
    name: string;
    contact?: string;
    address?: string;
  }): Promise<SupplierResponseDto> {
    const [newSupplier] = await this.databaseService.db
      .insert(suppliers)
      .values({
        name: supplierData.name,
        contact: supplierData.contact,
        address: supplierData.address,
      })
      .returning();

    return this.findById(newSupplier.id.toString());
  }

  async update(
    id: string,
    supplierData: {
      name?: string;
      contact?: string;
      address?: string;
    }
  ): Promise<SupplierResponseDto> {
    const [updatedSupplier] = await this.databaseService.db
      .update(suppliers)
      .set({
        name: supplierData.name,
        contact: supplierData.contact,
        address: supplierData.address,
      })
      .where(eq(suppliers.id, parseInt(id)))
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
      .where(eq(suppliers.id, parseInt(id)))
      .limit(1);

    if (supplier.length === 0) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    await this.databaseService.db
      .delete(suppliers)
      .where(eq(suppliers.id, parseInt(id)));
  }
}
