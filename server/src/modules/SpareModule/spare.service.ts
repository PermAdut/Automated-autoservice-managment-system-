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
import { eq, ilike, desc, asc, or, sql } from 'drizzle-orm';
import {
  CreateSpareStockDto,
  UpdateSpareStockDto,
} from './Dto/create-spare-stock.dto';

@Injectable()
export class SpareService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy: 'name' | 'quantity' | 'price' | 'id' | undefined = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
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
            ilike(spareParts.name, `%${search}%`),
            ilike(spareParts.partNumber, `%${search}%`),
            ilike(stores.location, `%${search}%`),
            sql`CAST(${spareParts.id} AS TEXT) LIKE ${`%${search}%`}`,
            sql`CAST(${sparePartStore.quantity} AS TEXT) LIKE ${`%${search}%`}`
          )
        ) as any;
      }

      if (sortBy === 'name') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderBy(spareParts.name)) as any;
      } else if (sortBy === 'quantity') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderBy(sparePartStore.quantity)) as any;
      } else if (sortBy === 'price') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderBy(spareParts.price)) as any;
      } else if (sortBy === 'id') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderBy(spareParts.id)) as any;
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

  async findById(id: number): Promise<SparePartStockResponseDto> {
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
      .where(eq(sparePartStore.sparePartId, id))
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
    throw new BadRequestException('Use createWithPayload');
  }

  async createWithPayload(
    payload: CreateSpareStockDto
  ): Promise<SparePartStockResponseDto> {
    const [created] = await this.databaseService.db
      .insert(sparePartStore)
      .values({
        sparePartId: payload.sparePartId,
        storeId: payload.storeId,
        quantity: payload.quantity,
      })
      .returning();

    return this.findById(created.sparePartId);
  }

  async updateWithPayload(
    id: number,
    payload: UpdateSpareStockDto
  ): Promise<SparePartStockResponseDto> {
    const updatePayload: Partial<typeof sparePartStore.$inferInsert> = {};

    if (payload.sparePartId !== undefined) {
      updatePayload.sparePartId = payload.sparePartId;
    }

    if (payload.storeId !== undefined) {
      updatePayload.storeId = payload.storeId;
    }

    if (payload.quantity !== undefined) {
      updatePayload.quantity = payload.quantity;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('No spare part stock fields to update');
    }

    const [updated] = await this.databaseService.db
      .update(sparePartStore)
      .set(updatePayload)
      .where(eq(sparePartStore.sparePartId, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Spare part with id ${id} not found`);
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.databaseService.db
      .delete(sparePartStore)
      .where(eq(sparePartStore.sparePartId, id));
  }

  async getStoresList() {
    return this.databaseService.db
      .select({
        id: stores.id,
        location: stores.location,
      })
      .from(stores);
  }

  async getCategoriesList() {
    return this.databaseService.db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      })
      .from(categories);
  }
}
