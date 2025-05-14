import { Injectable, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database/database.service';
import { OrderResponseDto } from './Dto/order.response';

@Injectable()
export class OrderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<OrderResponseDto[]> {
    try {
      const ordersResult = await this.databaseService.query(
        `
        SELECT 
          o.id,
          o."userId",
          o."carId",
          o."employeeId",
          o.status,
          o."createdAt",
          o."updatedAt",
          o."completedAt",
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'description', s.description,
                'price', s.price
              )
            ) FROM public."Services_Orders" so
            JOIN public."Services" s ON so."servicesId" = s.id
            WHERE so."orderId" = o.id),
            '[]'
          ) as services,
          COALESCE(
            (SELECT json_agg(
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
              )
            ) FROM public."SparePart_Orders" spo
            JOIN public."SparePart" sp ON spo."sparePartId" = sp.id
            JOIN public."Categories" c ON sp."categoryId" = c.id
            WHERE spo."ordersId" = o.id),
            '[]'
          ) as sparePart
        FROM public."Orders" o
        `,
      );

      console.log('Raw query result:', JSON.stringify(ordersResult, null, 2));

      return plainToInstance(OrderResponseDto, ordersResult, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Failed to fetch orders');
    }
  }
}
