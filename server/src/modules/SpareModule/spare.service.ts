import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { plainToInstance } from 'class-transformer';
import { SparePartStockResponseDto } from './Dto/spare.response';

@Injectable()
export class SpareService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<SparePartStockResponseDto[]> {
    try {
      const sparePartsResult = await this.databaseService.query(
        `
        SELECT 
          s.id AS store_id,
          s.location,
          sps.quantity,
          json_build_object(
            'id', sp.id,
            'name', sp.name,
            'partNumber', sp."partNumber",
            'price', sp.price,
            'category', json_build_object(
              'id', c.id,
              'name', c.name,
              'description', c.description
            )
          ) AS "sparePart"
        FROM public."SparePart_Store" sps
        JOIN public."SparePart" sp ON sps."sparePartId" = sp.id
        JOIN public."Categories" c ON sp."categoryId" = c.id
        JOIN public."Store" s ON sps."storeId" = s.id
        `,
      );

      // Для отладки: логируем результат до сериализации
      console.log(
        'Raw query result:',
        JSON.stringify(sparePartsResult, null, 2),
      );

      // Сериализация в DTO
      const result = plainToInstance(
        SparePartStockResponseDto,
        sparePartsResult,
        {
          excludeExtraneousValues: true,
        },
      );

      // Логируем результат после сериализации
      console.log('Serialized result:', JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('Error fetching spare parts stock:', error);
      throw new BadRequestException('Failed to fetch spare parts stock');
    }
  }
}
