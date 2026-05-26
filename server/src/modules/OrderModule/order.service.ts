import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database/database.service';
import { StockService } from '../SpareModule/stock.service';
import { NotificationService } from '../NotificationModule/notification.service';
import { PromotionsService } from '../PromotionsModule/promotions.service';
import { CorporateService } from '../CorporateModule/corporate.service';
import { WarrantyService } from '../WarrantyModule/warranty.service';
import { ScheduleOptimizationService } from '../ScheduleModule/schedule.service';
import { OrderResponseDto } from './Dto/order.response';
import { CreateOrderDto, UpdateOrderDto } from './Dto/create-order.dto';
import {
  orders,
  servicesOrders,
  services,
  sparePartOrders,
  spareParts,
  categories,
  payments,
} from '../database/schema';
import { eq, like, desc, asc, or, and, sql, type SQL } from 'drizzle-orm';

const VALID_STATUSES = [
  'pending',
  'diagnosed',
  'in_progress',
  'quality_check',
  'completed',
  'cancelled',
  // legacy values in DB
  'created',
  'quality_control',
] as const;

/** State machine — см. docs/functional-requirements/FT-04-orders.md */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['diagnosed', 'cancelled'],
  diagnosed: ['in_progress'],
  in_progress: ['quality_check', 'diagnosed', 'cancelled'],
  quality_check: ['completed', 'in_progress'],
  completed: [],
  cancelled: [],
  // legacy aliases
  created: ['diagnosed', 'cancelled'],
  quality_control: ['completed', 'in_progress'],
};

function normalizeOrderStatus(status: string | null | undefined): string {
  if (!status || status === 'created') return 'pending';
  if (status === 'quality_control') return 'quality_check';
  return status;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly stockService: StockService,
    private readonly notificationService: NotificationService,
    private readonly promotionsService: PromotionsService,
    private readonly corporateService: CorporateService,
    private readonly warrantyService: WarrantyService,
    @Inject(forwardRef(() => ScheduleOptimizationService))
    private readonly scheduleService: ScheduleOptimizationService,
  ) {}

  async findAll(
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    userId?: string,
    branchId?: string,
  ): Promise<OrderResponseDto[]> {
    try {
      const query = this.databaseService.db.select().from(orders).$dynamic();

      const conditions: SQL[] = [];
      if (userId) {
        conditions.push(eq(orders.userId, userId));
      }
      if (branchId) {
        conditions.push(eq(orders.branchId, branchId));
      }

      if (search) {
        const searchConditions = [
          like(orders.status, `%${search}%`),
          sql`CAST(${orders.id} AS TEXT) LIKE ${`%${search}%`}`,
          sql`CAST(${orders.userId} AS TEXT) LIKE ${`%${search}%`}`,
          sql`CAST(${orders.employeeId} AS TEXT) LIKE ${`%${search}%`}`,
        ];

        if (conditions.length > 0) {
          query.where(and(...conditions, or(...searchConditions)));
        } else {
          query.where(or(...searchConditions));
        }
      } else if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      if (sortBy) {
        const orderBy = sortOrder === 'desc' ? desc : asc;
        if (sortBy === 'createdAt') {
          query.orderBy(orderBy(orders.createdAt));
        } else if (sortBy === 'status') {
          query.orderBy(orderBy(orders.status));
        } else if (sortBy === 'id') {
          query.orderBy(orderBy(orders.id));
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
    if (!orderData.userId) {
      throw new BadRequestException('User ID is required');
    }

    const newOrderId = await this.databaseService.db.transaction(async tx => {
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
        await this.stockService.reserveForOrder(
          tx,
          newOrder.id,
          orderData.userId,
          orderData.spareParts.map(sp => ({
            sparePartId: sp.sparePartId,
            quantity: sp.quantity,
          })),
        );

        await tx.insert(sparePartOrders).values(
          orderData.spareParts.map(sparePart => ({
            ordersId: newOrder.id,
            sparePartId: sparePart.sparePartId,
            quantity: sparePart.quantity,
          }))
        );
      }

      return newOrder.id;
    });

    void this.scheduleService.optimizeSchedule().catch(() => undefined);

    const created = await this.findById(newOrderId);
    await this.notificationService.notifyUser(
      orderData.userId,
      'Заказ создан',
      `Заказ #${newOrderId.slice(0, 8)} принят в обработку`,
    );

    if (orderData.carId) {
      const amount = await this.getOrderTotalRub(newOrderId);
      const alert = await this.corporateService.checkCreditLimitAlert(
        orderData.carId,
        amount,
      );
      if (alert?.alert && alert.managerUserId) {
        await this.notificationService.notifyUser(
          alert.managerUserId,
          'Лимит договора',
          `${alert.companyName}: расход ${alert.percent}% от лимита (${alert.spent?.toFixed(0)} / ${alert.limit?.toFixed(0)} BYN)`,
        );
      }
    }

    return created;
  }

  async update(
    id: string,
    orderData: UpdateOrderDto,
    expectedVersion?: number,
  ): Promise<OrderResponseDto> {
    let targetOrderId = id;
    let previousStatus: string | null = null;
    let orderUserId: string | null = null;
    let shouldEarnLoyalty = false;

    await this.databaseService.db.transaction(async tx => {
      const [existing] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);

      if (!existing) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      if (
        expectedVersion !== undefined &&
        existing.version !== expectedVersion
      ) {
        throw new BadRequestException(
          `Version conflict: expected ${expectedVersion}, got ${existing.version}`,
        );
      }

      previousStatus = existing.status ?? null;
      orderUserId = existing.userId;

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

      if (orderData.status !== undefined && orderData.status !== null) {
        const next = orderData.status;
        const current = normalizeOrderStatus(existing.status);
        const allowed =
          STATUS_TRANSITIONS[current] ?? STATUS_TRANSITIONS.pending;
        if (!VALID_STATUSES.includes(next as (typeof VALID_STATUSES)[number])) {
          throw new BadRequestException(`Invalid status: ${next}`);
        }
        const normalizedNext = normalizeOrderStatus(next);
        if (current !== normalizedNext && !allowed.includes(normalizedNext)) {
          throw new BadRequestException(
            `Cannot transition from ${current} to ${next}`,
          );
        }

        if (normalizedNext === 'completed' && current !== 'completed') {
          await this.stockService.writeOffOnComplete(tx, id, existing.userId);
          shouldEarnLoyalty = true;
        }
        if (normalizedNext === 'cancelled' && current !== 'cancelled') {
          await this.stockService.releaseOnCancel(tx, id, existing.userId);
        }

        updatePayload.status =
          next === 'quality_control' ? 'quality_check' : next;
        updatePayload.updatedAt = new Date();
        if (orderData.completedAt !== undefined) {
          updatePayload.completedAt = orderData.completedAt
            ? new Date(orderData.completedAt)
            : null;
        } else if (normalizedNext === 'completed') {
          updatePayload.completedAt = new Date();
        }
      }

      if (orderData.createdAt !== undefined) {
        updatePayload.createdAt = new Date(orderData.createdAt);
      }

      if (orderData.updatedAt !== undefined) {
        updatePayload.updatedAt = new Date(orderData.updatedAt);
      }

      updatePayload.version = (existing.version ?? 1) + 1;

      if (Object.keys(updatePayload).length > 0) {
        const [updatedOrder] = await tx
          .update(orders)
          .set(updatePayload)
          .where(eq(orders.id, id))
          .returning();

        targetOrderId = updatedOrder.id;
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
        await this.stockService.releaseOnCancel(tx, id, existing.userId);
        await tx
          .delete(sparePartOrders)
          .where(eq(sparePartOrders.ordersId, id));

        if (orderData.spareParts.length) {
          await this.stockService.reserveForOrder(
            tx,
            id,
            existing.userId,
            orderData.spareParts.map(sp => ({
              sparePartId: sp.sparePartId,
              quantity: sp.quantity,
            })),
          );
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

    if (
      orderData.status &&
      orderUserId &&
      previousStatus !== orderData.status
    ) {
      await this.notificationService.notifyUser(
        orderUserId,
        'Статус заказа изменён',
        `Заказ #${id.slice(0, 8)}: ${previousStatus} → ${orderData.status}`,
      );
    }

    if (shouldEarnLoyalty && orderUserId) {
      const amount = await this.getOrderTotalRub(id);
      void this.promotionsService
        .earnForCompletedOrder(orderUserId, id, amount)
        .catch(() => undefined);

      const existing = await this.warrantyService.findByOrder(id);
      if (!existing.length) {
        void this.warrantyService
          .create({
            orderId: id,
            type: 'work',
            description: 'Гарантия на выполненные работы',
            durationMonths: 6,
          })
          .catch(() => undefined);
      }
    }

    void this.scheduleService.optimizeSchedule().catch(() => undefined);

    return this.findById(targetOrderId);
  }

  private async getOrderTotalRub(orderId: string): Promise<number> {
    const [payment] = await this.databaseService.db
      .select({ amount: payments.amount })
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (payment?.amount) {
      return parseFloat(String(payment.amount));
    }

    const svcRows = await this.databaseService.db
      .select({ price: services.price, quantity: servicesOrders.quantity })
      .from(servicesOrders)
      .innerJoin(services, eq(servicesOrders.servicesId, services.id))
      .where(eq(servicesOrders.orderId, orderId));

    const partsRows = await this.databaseService.db
      .select({ price: spareParts.price, quantity: sparePartOrders.quantity })
      .from(sparePartOrders)
      .innerJoin(spareParts, eq(sparePartOrders.sparePartId, spareParts.id))
      .where(eq(sparePartOrders.ordersId, orderId));

    const svcTotal = svcRows.reduce(
      (sum, r) => sum + parseFloat(String(r.price)) * (r.quantity ?? 1),
      0,
    );
    const partsTotal = partsRows.reduce(
      (sum, r) => sum + parseFloat(String(r.price)) * (r.quantity ?? 1),
      0,
    );

    return svcTotal + partsTotal;
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
