import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  sparePartOrders,
  sparePartStore,
  spareParts,
  stockMovements,
  stores,
} from '../database/schema';
import { eq, sql } from 'drizzle-orm';

type DbTx = Parameters<
  Parameters<DatabaseService['db']['transaction']>[0]
>[0];

export type StockMovementType =
  | 'receipt'
  | 'issue'
  | 'reserve'
  | 'unreserve'
  | 'transfer'
  | 'return';

@Injectable()
export class StockService {
  constructor(private readonly databaseService: DatabaseService) {}

  async reserveForOrder(
    tx: DbTx,
    orderId: string,
    userId: string,
    items: { sparePartId: string; quantity: number }[],
  ): Promise<void> {
    for (const item of items) {
      const storeId = await this.pickStoreWithStock(tx, item.sparePartId, item.quantity);
      if (!storeId) {
        const [part] = await tx
          .select({ name: spareParts.name })
          .from(spareParts)
          .where(eq(spareParts.id, item.sparePartId))
          .limit(1);
        throw new BadRequestException(
          `Insufficient stock for ${part?.name ?? item.sparePartId}`,
        );
      }

      await tx
        .update(sparePartStore)
        .set({
          quantity: sql`${sparePartStore.quantity} - ${item.quantity}`,
        })
        .where(
          sql`${sparePartStore.sparePartId} = ${item.sparePartId} AND ${sparePartStore.storeId} = ${storeId}`,
        );

      await tx
        .update(spareParts)
        .set({
          reservedQuantity: sql`${spareParts.reservedQuantity} + ${item.quantity}`,
        })
        .where(eq(spareParts.id, item.sparePartId));

      await tx.insert(stockMovements).values({
        sparePartId: item.sparePartId,
        storeId,
        type: 'reserve',
        quantity: item.quantity,
        orderId,
        userId,
        notes: `Reserved for order ${orderId}`,
      });
    }
  }

  async writeOffOnComplete(
    tx: DbTx,
    orderId: string,
    userId: string,
  ): Promise<void> {
    const items = await tx
      .select({
        sparePartId: sparePartOrders.sparePartId,
        quantity: sparePartOrders.quantity,
      })
      .from(sparePartOrders)
      .where(eq(sparePartOrders.ordersId, orderId));

    for (const item of items) {
      const qty = Number(item.quantity ?? 0);
      if (qty <= 0) continue;

      await tx
        .update(spareParts)
        .set({
          reservedQuantity: sql`GREATEST(0, ${spareParts.reservedQuantity} - ${qty})`,
        })
        .where(eq(spareParts.id, item.sparePartId));

      const [lastReserve] = await tx
        .select({ storeId: stockMovements.storeId })
        .from(stockMovements)
        .where(
          sql`${stockMovements.orderId} = ${orderId} AND ${stockMovements.sparePartId} = ${item.sparePartId} AND ${stockMovements.type} = 'reserve'`,
        )
        .limit(1);

      const storeId =
        lastReserve?.storeId ??
        (await this.pickAnyStoreForPart(tx, item.sparePartId));

      if (!storeId) continue;

      await tx.insert(stockMovements).values({
        sparePartId: item.sparePartId,
        storeId,
        type: 'issue',
        quantity: qty,
        orderId,
        userId,
        notes: `Issued on order ${orderId} completion`,
      });
    }
  }

  async releaseOnCancel(
    tx: DbTx,
    orderId: string,
    userId: string,
  ): Promise<void> {
    const reserves = await tx
      .select()
      .from(stockMovements)
      .where(
        sql`${stockMovements.orderId} = ${orderId} AND ${stockMovements.type} = 'reserve'`,
      );

    for (const reserve of reserves) {
      const qty = Number(reserve.quantity);
      await tx
        .update(sparePartStore)
        .set({
          quantity: sql`${sparePartStore.quantity} + ${qty}`,
        })
        .where(
          sql`${sparePartStore.sparePartId} = ${reserve.sparePartId} AND ${sparePartStore.storeId} = ${reserve.storeId}`,
        );

      await tx
        .update(spareParts)
        .set({
          reservedQuantity: sql`GREATEST(0, ${spareParts.reservedQuantity} - ${qty})`,
        })
        .where(eq(spareParts.id, reserve.sparePartId));

      await tx.insert(stockMovements).values({
        sparePartId: reserve.sparePartId,
        storeId: reserve.storeId,
        type: 'unreserve',
        quantity: qty,
        orderId,
        userId,
        notes: `Released on order ${orderId} cancel`,
      });
    }
  }

  async getMovements(limit = 100) {
    return this.databaseService.db
      .select()
      .from(stockMovements)
      .orderBy(sql`${stockMovements.createdAt} DESC`)
      .limit(limit);
  }

  async getLowStockItems() {
    return this.databaseService.db
      .select({
        id: spareParts.id,
        name: spareParts.name,
        partNumber: spareParts.partNumber,
        minQuantity: spareParts.minQuantity,
        totalQuantity: sql<number>`COALESCE(SUM(${sparePartStore.quantity}), 0)`,
      })
      .from(spareParts)
      .leftJoin(sparePartStore, eq(sparePartStore.sparePartId, spareParts.id))
      .groupBy(spareParts.id)
      .having(sql`COALESCE(SUM(${sparePartStore.quantity}), 0) < ${spareParts.minQuantity}`);
  }

  private async pickStoreWithStock(
    tx: DbTx,
    sparePartId: string,
    quantity: number,
  ): Promise<string | null> {
    const [row] = await tx
      .select({ storeId: sparePartStore.storeId })
      .from(sparePartStore)
      .where(
        sql`${sparePartStore.sparePartId} = ${sparePartId} AND ${sparePartStore.quantity} >= ${quantity}`,
      )
      .limit(1);
    return row?.storeId ?? null;
  }

  private async pickAnyStoreForPart(
    tx: DbTx,
    sparePartId: string,
  ): Promise<string | null> {
    const [row] = await tx
      .select({ storeId: sparePartStore.storeId })
      .from(sparePartStore)
      .where(eq(sparePartStore.sparePartId, sparePartId))
      .limit(1);
    if (row?.storeId) return row.storeId;

    const [store] = await tx.select({ id: stores.id }).from(stores).limit(1);
    return store?.id ?? null;
  }
}
