import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database/database.service';
import { OrderResponseDto } from './Dto/order.response';
import { CreateOrderDto, UpdateOrderDto } from './Dto/create-order.dto';
import {
  orders,
  servicesOrders,
  services,
  sparePartOrders,
  spareParts,
  categories,
} from '../database/schema';
import { eq, like, desc, asc, or, and, sql } from 'drizzle-orm';

@Injectable()
export class OrderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    userId?: string
  ): Promise<OrderResponseDto[]> {
    try {
      let query = this.databaseService.db.select().from(orders);

      // Фильтруем по userId, если указан (для обычных пользователей)
      const conditions: any[] = [];
      if (userId) {
        conditions.push(eq(orders.userId, userId));
      }

      if (search) {
        const searchConditions = [
          like(orders.status, `%${search}%`),
          sql`CAST(${orders.id} AS TEXT) LIKE ${`%${search}%`}`,
          sql`CAST(${orders.userId} AS TEXT) LIKE ${`%${search}%`}`,
          sql`CAST(${orders.employeeId} AS TEXT) LIKE ${`%${search}%`}`,
        ];

        if (conditions.length > 0) {
          query = query.where(
            and(...conditions, or(...searchConditions))
          ) as any;
        } else {
          query = query.where(or(...searchConditions)) as any;
        }
      } else if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      if (sortBy) {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        if (sortBy === 'createdAt') {
          query = query.orderBy(orderBy(orders.createdAt)) as any;
        } else if (sortBy === 'status') {
          query = query.orderBy(orderBy(orders.status)) as any;
        } else if (sortBy === 'id') {
          query = query.orderBy(orderBy(orders.id)) as any;
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
              quantity: servicesOrders.quantity,
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
              quantity: sparePartOrders.quantity,
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
              quantity: Number(s.quantity),
            })),
            sparePart: orderSpareParts.map(sp => ({
              ...sp,
              price: parseFloat(sp.price.toString()),
              quantity: Number(sp.quantity),
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
      .where(eq(orders.id, id))
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
        quantity: servicesOrders.quantity,
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
        quantity: sparePartOrders.quantity,
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
        quantity: Number(s.quantity),
      })),
      sparePart: orderSpareParts.map(sp => ({
        ...sp,
        price: parseFloat(sp.price.toString()),
        quantity: Number(sp.quantity),
        category: {
          ...sp.category,
          description: sp.category.description || null,
        },
      })),
    };
  }

  async create(
    orderData: CreateOrderDto & { userId: string }
  ): Promise<OrderResponseDto> {
    let createdOrderId: string | null = null;

    if (!orderData.userId) {
      throw new BadRequestException('User ID is required');
    }

    await this.databaseService.db.transaction(async tx => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: orderData.userId,
          carId: orderData.carId,
          employeeId: orderData.employeeId,
          status: 'pending',
          createdAt: orderData.createdAt
            ? new Date(orderData.createdAt)
            : undefined,
          updatedAt: orderData.updatedAt
            ? new Date(orderData.updatedAt)
            : undefined,
          completedAt:
            orderData.completedAt !== undefined
              ? orderData.completedAt
                ? new Date(orderData.completedAt)
                : null
              : undefined,
        })
        .returning();

      createdOrderId = newOrder.id;

      if (orderData.services?.length) {
        await tx.insert(servicesOrders).values(
          orderData.services.map(service => ({
            orderId: newOrder.id,
            servicesId: service.serviceId,
            quantity: service.quantity,
          }))
        );
      }

      if (orderData.spareParts?.length) {
        await tx.insert(sparePartOrders).values(
          orderData.spareParts.map(sparePart => ({
            ordersId: newOrder.id,
            sparePartId: sparePart.sparePartId,
            quantity: sparePart.quantity,
          }))
        );
      }
    });

    if (!createdOrderId) {
      throw new BadRequestException('Failed to create order');
    }

    return this.findById(createdOrderId);
  }

  async update(
    id: string,
    orderData: UpdateOrderDto
  ): Promise<OrderResponseDto> {
    let targetOrderId = id;

    await this.databaseService.db.transaction(async tx => {
      const updatePayload: Partial<typeof orders.$inferInsert> = {};

      if (orderData.userId !== undefined) {
        updatePayload.userId = orderData.userId;
      }

      if (orderData.carId !== undefined) {
        updatePayload.carId = orderData.carId;
      }

      if (orderData.employeeId !== undefined) {
        updatePayload.employeeId = orderData.employeeId;
      }

      if (orderData.status !== undefined) {
        updatePayload.status = orderData.status;
        updatePayload.updatedAt = new Date();
        if (orderData.completedAt !== undefined) {
          updatePayload.completedAt = orderData.completedAt
            ? new Date(orderData.completedAt)
            : null;
        } else if (orderData.status === 'completed') {
          updatePayload.completedAt = new Date();
        }
      }

      if (orderData.createdAt !== undefined) {
        updatePayload.createdAt = new Date(orderData.createdAt);
      }

      if (orderData.updatedAt !== undefined) {
        updatePayload.updatedAt = new Date(orderData.updatedAt);
      }

      if (
        updatePayload.status !== undefined ||
        updatePayload.userId !== undefined ||
        updatePayload.carId !== undefined ||
        updatePayload.employeeId !== undefined ||
        updatePayload.createdAt !== undefined ||
        updatePayload.updatedAt !== undefined ||
        updatePayload.completedAt !== undefined
      ) {
        const [updatedOrder] = await tx
          .update(orders)
          .set(updatePayload)
          .where(eq(orders.id, id))
          .returning();

        if (!updatedOrder) {
          throw new NotFoundException(`Order with id ${id} not found`);
        }

        targetOrderId = updatedOrder.id;
      } else {
        const [existing] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, id))
          .limit(1);

        if (!existing) {
          throw new NotFoundException(`Order with id ${id} not found`);
        }
      }

      if (orderData.services !== undefined) {
        await tx.delete(servicesOrders).where(eq(servicesOrders.orderId, id));

        if (orderData.services.length) {
          await tx.insert(servicesOrders).values(
            orderData.services.map(service => ({
              orderId: id,
              servicesId: service.serviceId,
              quantity: service.quantity,
            }))
          );
        }
      }

      if (orderData.spareParts !== undefined) {
        await tx
          .delete(sparePartOrders)
          .where(eq(sparePartOrders.ordersId, id));

        if (orderData.spareParts.length) {
          await tx.insert(sparePartOrders).values(
            orderData.spareParts.map(sparePart => ({
              ordersId: id,
              sparePartId: sparePart.sparePartId,
              quantity: sparePart.quantity,
            }))
          );
        }
      }
    });

    return this.findById(targetOrderId);
  }

  async delete(id: string): Promise<void> {
    const order = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (order.length === 0) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    await this.databaseService.db.delete(orders).where(eq(orders.id, id));
  }
}
