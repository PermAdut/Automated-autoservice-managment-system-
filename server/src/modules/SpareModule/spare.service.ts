import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { plainToInstance } from 'class-transformer';
import { SparePartStockResponseDto } from './Dto/spare.response';
import {
  sparePartStore,
  spareParts,
  stores,
  categories,
} from '../database/schema';
import { eq, like, or, desc, asc } from 'drizzle-orm';

@Injectable()
export class SpareService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<SparePartStockResponseDto[]> {
    try {
      let query = this.databaseService.db
        .select({
          store_id: stores.id,
          location: stores.location,
          quantity: sparePartStore.quantity,
          sparePartId: spareParts.id,
          sparePartName: spareParts.name,
          sparePartNumber: spareParts.partNumber,
          sparePartPrice: spareParts.price,
          categoryId: categories.id,
          categoryName: categories.name,
          categoryDescription: categories.description,
        })
        .from(sparePartStore)
        .innerJoin(spareParts, eq(sparePartStore.sparePartId, spareParts.id))
        .innerJoin(categories, eq(spareParts.categoryId, categories.id))
        .innerJoin(stores, eq(sparePartStore.storeId, stores.id));

      if (search) {
        query = query.where(
          or(
            like(spareParts.name, `%${search}%`),
            like(spareParts.partNumber, `%${search}%`),
            like(categories.name, `%${search}%`)
          )
        ) as any;
      }

      if (sortBy) {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        if (sortBy === 'name') {
          query = query.orderBy(orderBy(spareParts.name)) as any;
        } else if (sortBy === 'price') {
          query = query.orderBy(orderBy(spareParts.price)) as any;
        }
      }

      const result = await query;

      // Transform the flat result into nested structure
      const transformedResult = result.map(row => ({
        store_id: row.store_id,
        location: row.location,
        quantity: row.quantity,
        sparePart: {
          id: row.sparePartId,
          name: row.sparePartName,
          partNumber: row.sparePartNumber,
          price: row.sparePartPrice.toString(),
          category: {
            id: row.categoryId,
            name: row.categoryName,
            description: row.categoryDescription || '',
          },
        },
      }));

      return plainToInstance(SparePartStockResponseDto, transformedResult, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error fetching spare parts stock:', error);
      throw new BadRequestException('Failed to fetch spare parts stock');
    }
  }

  async findById(id: string): Promise<SparePartStockResponseDto> {
    const [result] = await this.databaseService.db
      .select({
        store_id: stores.id,
        location: stores.location,
        quantity: sparePartStore.quantity,
        sparePartId: spareParts.id,
        sparePartName: spareParts.name,
        sparePartNumber: spareParts.partNumber,
        sparePartPrice: spareParts.price,
        categoryId: categories.id,
        categoryName: categories.name,
        categoryDescription: categories.description,
      })
      .from(sparePartStore)
      .innerJoin(spareParts, eq(sparePartStore.sparePartId, spareParts.id))
      .innerJoin(categories, eq(spareParts.categoryId, categories.id))
      .innerJoin(stores, eq(sparePartStore.storeId, stores.id))
      .where(eq(sparePartStore.sparePartId, parseInt(id)))
      .limit(1);

    if (!result) {
      throw new NotFoundException(`Spare part with id ${id} not found`);
    }

    // Transform the flat result into nested structure
    const transformedResult = {
      store_id: result.store_id,
      location: result.location,
      quantity: result.quantity,
      sparePart: {
        id: result.sparePartId,
        name: result.sparePartName,
        partNumber: result.sparePartNumber,
        price: result.sparePartPrice.toString(),
        category: {
          id: result.categoryId,
          name: result.categoryName,
          description: result.categoryDescription || '',
        },
      },
    };

    return plainToInstance(SparePartStockResponseDto, transformedResult, {
      excludeExtraneousValues: true,
    });
  }

  async create(): Promise<SparePartStockResponseDto> {
    // Implementation for creating spare part stock
    throw new BadRequestException('Create not implemented yet');
  }

  async update(): Promise<SparePartStockResponseDto> {
    // Implementation for updating spare part stock
    throw new BadRequestException('Update not implemented yet');
  }

  async delete(id: string): Promise<void> {
    await this.databaseService.db
      .delete(sparePartStore)
      .where(eq(sparePartStore.sparePartId, parseInt(id)));
  }
}
