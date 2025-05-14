import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ServiceResponseDto } from './Dto/service.response';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class ServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<ServiceResponseDto[]> {
    try {
      const services = await this.databaseService.query(
        `SELECT * FROM "Services"`,
      );
      return plainToInstance(ServiceResponseDto, services);
    } catch (error: unknown) {
      throw new BadRequestException('Failed to fetch services', {
        cause: error as Error,
      });
    }
  }
}
