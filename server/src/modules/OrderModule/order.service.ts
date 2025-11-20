import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database/database.service';
import { OrderResponseDto } from './Dto/order.response';
import {
  orders,
  servicesOrders,
  services,
  sparePartOrders,
  spareParts,
  categories,
} from '../database/schema';
import { eq, like, desc, asc } from 'drizzle-orm';

@Injectable()
export class OrderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<OrderResponseDto[]> {
    try {
      let query = this.databaseService.db.select().from(orders);

      if (search) {
        query = query.where(like(orders.status, `%${search}%`)) as any;
      }

      if (sortBy) {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        if (sortBy === 'createdAt') {
          query = query.orderBy(orderBy(orders.createdAt)) as any;
        } else if (sortBy === 'status') {
          query = query.orderBy(orderBy(orders.status)) as any;
        }
      }

      const ordersList = await query;

      const ordersResponse: OrderResponseDto[] = await Promise.all(
        ordersList.map(async order => {
          const orderServices = await this.databaseService.db
            .select({
              id: services.id,
              name: services.name,
              description: services.description,
              price: services.price,
            })
            .from(servicesOrders)
            .innerJoin(services, eq(servicesOrders.servicesId, services.id))
            .where(eq(servicesOrders.orderId, order.id));

          const orderSpareParts = await this.databaseService.db
            .select({
              id: spareParts.id,
              name: spareParts.name,
              partNumber: spareParts.partNumber,
              price: spareParts.price,
              category: {
                id: categories.id,
                name: categories.name,
                description: categories.description,
              },
            })
            .from(sparePartOrders)
            .innerJoin(
              spareParts,
              eq(sparePartOrders.sparePartId, spareParts.id)
            )
            .innerJoin(categories, eq(spareParts.categoryId, categories.id))
            .where(eq(sparePartOrders.ordersId, order.id));

          return {
            id: order.id,
            userId: order.userId,
            carId: order.carId,
            employeeId: order.employeeId,
            status: order.status || null,
            createdAt: order.createdAt?.toISOString() || '',
            updatedAt: order.updatedAt?.toISOString() || null,
            completedAt: order.completedAt?.toISOString() || null,
            services: orderServices.map(s => ({
              ...s,
              description: s.description || null,
              price: parseFloat(s.price.toString()),
            })),
            sparePart: orderSpareParts.map(sp => ({
              ...sp,
              price: parseFloat(sp.price.toString()),
              category: {
                ...sp.category,
                description: sp.category.description || null,
              },
            })),
          };
        })
      );

      return plainToInstance(OrderResponseDto, ordersResponse, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Failed to fetch orders');
    }
  }

  async findById(id: string): Promise<OrderResponseDto> {
    const [order] = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const orderServices = await this.databaseService.db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        price: services.price,
      })
      .from(servicesOrders)
      .innerJoin(services, eq(servicesOrders.servicesId, services.id))
      .where(eq(servicesOrders.orderId, order.id));

    const orderSpareParts = await this.databaseService.db
      .select({
        id: spareParts.id,
        name: spareParts.name,
        partNumber: spareParts.partNumber,
        price: spareParts.price,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
        },
      })
      .from(sparePartOrders)
      .innerJoin(spareParts, eq(sparePartOrders.sparePartId, spareParts.id))
      .innerJoin(categories, eq(spareParts.categoryId, categories.id))
      .where(eq(sparePartOrders.ordersId, order.id));

    return {
      id: order.id,
      userId: order.userId,
      carId: order.carId,
      employeeId: order.employeeId,
      status: order.status || null,
      createdAt: order.createdAt?.toISOString() || '',
      updatedAt: order.updatedAt?.toISOString() || null,
      completedAt: order.completedAt?.toISOString() || null,
      services: orderServices.map(s => ({
        ...s,
        description: s.description || null,
        price: parseFloat(s.price.toString()),
      })),
      sparePart: orderSpareParts.map(sp => ({
        ...sp,
        price: parseFloat(sp.price.toString()),
        category: {
          ...sp.category,
          description: sp.category.description || null,
        },
      })),
    };
  }

  async create(orderData: any): Promise<OrderResponseDto> {
    const [newOrder] = await this.databaseService.db
      .insert(orders)
      .values({
        userId: orderData.userId,
        carId: orderData.carId,
        employeeId: orderData.employeeId,
        status: orderData.status || 'pending',
      })
      .returning();

    return this.findById(newOrder.id.toString());
  }

  async update(id: string, orderData: any): Promise<OrderResponseDto> {
    const [updatedOrder] = await this.databaseService.db
      .update(orders)
      .set({
        status: orderData.status,
        updatedAt: new Date(),
        completedAt: orderData.status === 'completed' ? new Date() : undefined,
      })
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const order = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (order.length === 0) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    await this.databaseService.db
      .delete(orders)
      .where(eq(orders.id, parseInt(id)));
  }
}
