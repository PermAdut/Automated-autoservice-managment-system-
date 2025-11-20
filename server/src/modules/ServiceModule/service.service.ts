import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ServiceResponseDto } from './Dto/service.response';
import { plainToInstance } from 'class-transformer';
import { services } from '../database/schema';
import { eq, like, or, desc, asc } from 'drizzle-orm';

@Injectable()
export class ServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<ServiceResponseDto[]> {
    try {
      let query = this.databaseService.db.select().from(services);

      if (search) {
        query = query.where(
          or(
            like(services.name, `%${search}%`),
            like(services.description, `%${search}%`)
          )
        ) as any;
      }

      if (sortBy) {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        if (sortBy === 'name') {
          query = query.orderBy(orderBy(services.name)) as any;
        } else if (sortBy === 'price') {
          query = query.orderBy(orderBy(services.price)) as any;
        }
      }

      const servicesList = await query;
      return plainToInstance(ServiceResponseDto, servicesList);
    } catch (error: unknown) {
      throw new BadRequestException('Failed to fetch services', {
        cause: error as Error,
      });
    }
  }

  async findById(id: string): Promise<ServiceResponseDto> {
    const [service] = await this.databaseService.db
      .select()
      .from(services)
      .where(eq(services.id, parseInt(id)))
      .limit(1);

    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    return plainToInstance(ServiceResponseDto, service);
  }

  async create(serviceData: any): Promise<ServiceResponseDto> {
    const [newService] = await this.databaseService.db
      .insert(services)
      .values({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
      })
      .returning();

    return plainToInstance(ServiceResponseDto, newService);
  }

  async update(id: string, serviceData: any): Promise<ServiceResponseDto> {
    const [updatedService] = await this.databaseService.db
      .update(services)
      .set({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
      })
      .where(eq(services.id, parseInt(id)))
      .returning();

    if (!updatedService) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    return plainToInstance(ServiceResponseDto, updatedService);
  }

  async delete(id: string): Promise<void> {
    const service = await this.databaseService.db
      .select()
      .from(services)
      .where(eq(services.id, parseInt(id)))
      .limit(1);

    if (service.length === 0) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    await this.databaseService.db
      .delete(services)
      .where(eq(services.id, parseInt(id)));
  }
}
