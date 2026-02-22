import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  discounts,
  orderDiscounts,
  loyaltyPrograms,
  loyaltyTransactions,
} from '../database/schema';
import { eq, and, desc, lte, gte, sql } from 'drizzle-orm';

@Injectable()
export class PromotionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Discounts
  async findActiveDiscounts() {
    const now = new Date();
    return this.databaseService.db
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.isActive, true),
          lte(discounts.startDate, now),
          gte(discounts.endDate, now),
        ),
      )
      .orderBy(discounts.name);
  }

  async findAll() {
    return this.databaseService.db
      .select()
      .from(discounts)
      .orderBy(desc(discounts.createdAt));
  }

  async createDiscount(data: {
    code?: string;
    name: string;
    description?: string;
    type: 'percent' | 'fixed' | 'free_service';
    value: string;
    minOrderAmount?: string;
    maxUsageCount?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(discounts)
      .values({
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      })
      .returning();
    return created;
  }

  async updateDiscount(
    id: string,
    data: Partial<{
      isActive: boolean;
      maxUsageCount: number;
      endDate: string;
      name: string;
      description: string;
    }>,
  ) {
    const payload: any = { ...data };
    if (data.endDate) payload.endDate = new Date(data.endDate);

    const [updated] = await this.databaseService.db
      .update(discounts)
      .set(payload)
      .where(eq(discounts.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Discount ${id} not found`);
    return updated;
  }

  async applyDiscountToOrder(
    orderId: string,
    discountCode: string,
    orderAmount: number,
  ) {
    const [discount] = await this.databaseService.db
      .select()
      .from(discounts)
      .where(and(eq(discounts.code, discountCode), eq(discounts.isActive, true)))
      .limit(1);

    if (!discount) {
      throw new NotFoundException(`Discount code "${discountCode}" not found or inactive`);
    }

    if (discount.maxUsageCount && discount.usedCount >= discount.maxUsageCount) {
      throw new BadRequestException('Discount usage limit reached');
    }

    const minAmount = discount.minOrderAmount
      ? parseFloat(discount.minOrderAmount)
      : 0;
    if (orderAmount < minAmount) {
      throw new BadRequestException(
        `Minimum order amount is ${minAmount}`,
      );
    }

    let appliedAmount = 0;
    if (discount.type === 'percent') {
      appliedAmount = (orderAmount * parseFloat(discount.value)) / 100;
    } else if (discount.type === 'fixed') {
      appliedAmount = Math.min(parseFloat(discount.value), orderAmount);
    }

    await this.databaseService.db
      .insert(orderDiscounts)
      .values({
        orderId,
        discountId: discount.id,
        appliedAmount: String(appliedAmount),
      })
      .onConflictDoNothing();

    await this.databaseService.db
      .update(discounts)
      .set({ usedCount: sql`${discounts.usedCount} + 1` })
      .where(eq(discounts.id, discount.id));

    return { discount, appliedAmount };
  }

  // Loyalty program
  async getLoyaltyByUser(userId: string) {
    const [program] = await this.databaseService.db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.userId, userId))
      .limit(1);

    return program ?? null;
  }

  async ensureLoyaltyProgram(userId: string) {
    const existing = await this.getLoyaltyByUser(userId);
    if (existing) return existing;

    const [created] = await this.databaseService.db
      .insert(loyaltyPrograms)
      .values({ userId })
      .returning();
    return created;
  }

  async addPoints(
    userId: string,
    points: number,
    type: 'earn' | 'bonus' | 'adjustment',
    orderId?: string,
    description?: string,
  ) {
    const program = await this.ensureLoyaltyProgram(userId);

    const newPoints = program.points + points;
    const newTotalEarned = program.totalEarned + points;
    const tier = this.calculateTier(newTotalEarned);

    await this.databaseService.db
      .update(loyaltyPrograms)
      .set({
        points: newPoints,
        totalEarned: newTotalEarned,
        tier,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyPrograms.id, program.id));

    await this.databaseService.db.insert(loyaltyTransactions).values({
      programId: program.id,
      orderId,
      type,
      points,
      description,
    });

    return { points: newPoints, tier, totalEarned: newTotalEarned };
  }

  async spendPoints(
    userId: string,
    points: number,
    orderId?: string,
    description?: string,
  ) {
    const program = await this.getLoyaltyByUser(userId);
    if (!program) throw new NotFoundException('Loyalty program not found');

    if (program.points < points) {
      throw new BadRequestException(
        `Insufficient points: have ${program.points}, need ${points}`,
      );
    }

    const newPoints = program.points - points;
    const newTotalSpent = program.totalSpent + points;

    await this.databaseService.db
      .update(loyaltyPrograms)
      .set({ points: newPoints, totalSpent: newTotalSpent, updatedAt: new Date() })
      .where(eq(loyaltyPrograms.id, program.id));

    await this.databaseService.db.insert(loyaltyTransactions).values({
      programId: program.id,
      orderId,
      type: 'spend',
      points: -points,
      description,
    });

    return { points: newPoints };
  }

  async getLoyaltyTransactions(userId: string) {
    const program = await this.getLoyaltyByUser(userId);
    if (!program) return [];

    return this.databaseService.db
      .select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.programId, program.id))
      .orderBy(desc(loyaltyTransactions.createdAt));
  }

  private calculateTier(
    totalEarned: number,
  ): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (totalEarned >= 10000) return 'platinum';
    if (totalEarned >= 5000) return 'gold';
    if (totalEarned >= 1000) return 'silver';
    return 'bronze';
  }
}
