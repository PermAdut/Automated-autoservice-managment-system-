import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ServiceResponseDto } from './Dto/service.response';
import { plainToInstance } from 'class-transformer';
import { services } from '../database/schema';
import { eq, ilike, desc, asc, or, sql } from 'drizzle-orm';
import { CreateServiceDto } from './Dto/create-service.dto';
import { UpdateServiceDto } from './Dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy: 'name' | 'price' | 'id' | undefined = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<ServiceResponseDto[]> {
    try {
      let query = this.databaseService.db.select().from(services);

      if (search) {
        query = query.where(
          or(
            ilike(services.name, `%${search}%`),
            sql`CAST(${services.id} AS TEXT) LIKE ${`%${search}%`}`,
            sql`CAST(${services.price} AS TEXT) LIKE ${`%${search}%`}`,
            services.description
              ? ilike(services.description, `%${search}%`)
              : sql`FALSE`
          )
        ) as typeof query;
      }

      if (sortBy === 'name') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderBy(services.name)) as typeof query;
      } else if (sortBy === 'price') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderBy(services.price)) as typeof query;
      } else if (sortBy === 'id') {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(orderBy(services.id)) as typeof query;
      }

      const servicesList = await query;
      const normalized = servicesList.map(service => ({
        ...service,
        price: Number(service.price),
      }));
      return plainToInstance(ServiceResponseDto, normalized);
    } catch (error: unknown) {
      throw new BadRequestException('Failed to fetch services', {
        cause: error as Error,
      });
    }
  }

  async findById(id: number): Promise<ServiceResponseDto> {
    const [service] = await this.databaseService.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    return plainToInstance(ServiceResponseDto, {
      ...service,
      price: Number(service.price),
    });
  }

  async create(serviceData: CreateServiceDto): Promise<ServiceResponseDto> {
    const [newService] = await this.databaseService.db
      .insert(services)
      .values({
        name: serviceData.name,
        description: serviceData.description ?? null,
        price: serviceData.price,
      })
      .returning();

    return plainToInstance(ServiceResponseDto, {
      ...newService,
      price: Number(newService.price),
    });
  }

  async update(
    id: number,
    serviceData: UpdateServiceDto
  ): Promise<ServiceResponseDto> {
    const updatePayload: Partial<typeof services.$inferInsert> = {};

    if (serviceData.name !== undefined) {
      updatePayload.name = serviceData.name;
    }

    if (serviceData.description !== undefined) {
      updatePayload.description = serviceData.description;
    }

    if (serviceData.price !== undefined) {
      updatePayload.price = serviceData.price;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('No service fields provided for update');
    }

    const [updatedService] = await this.databaseService.db
      .update(services)
      .set(updatePayload)
      .where(eq(services.id, id))
      .returning();

    if (!updatedService) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    return plainToInstance(ServiceResponseDto, {
      ...updatedService,
      price: Number(updatedService.price),
    });
  }

  async delete(id: number): Promise<void> {
    const service = await this.databaseService.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (service.length === 0) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    await this.databaseService.db.delete(services).where(eq(services.id, id));
  }
}
