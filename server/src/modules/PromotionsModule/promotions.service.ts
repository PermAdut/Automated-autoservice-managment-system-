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
  tenantSettings,
} from '../database/schema';
import { eq, and, desc, lte, gte, sql, or, isNull } from 'drizzle-orm';

const TIER_LABELS: Record<string, string> = {
  bronze: 'Стандарт',
  silver: 'Серебро',
  gold: 'Золото',
  platinum: 'Премиум',
};

const TIER_MULTIPLIERS: Record<string, number> = {
  bronze: 1.0,
  silver: 1.1,
  gold: 1.2,
  platinum: 1.5,
};

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
    const payload: Partial<{ isActive: boolean; maxUsageCount: number; endDate: Date; name: string; description: string }> = {
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.maxUsageCount !== undefined && { maxUsageCount: data.maxUsageCount }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
    };

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

    if (!program) return null;

    return {
      ...program,
      tierLabel: TIER_LABELS[program.tier] ?? program.tier,
      tierMultiplier: TIER_MULTIPLIERS[program.tier] ?? 1,
    };
  }

  async findPersonalDiscounts(userId: string) {
    const now = new Date();
    return this.databaseService.db
      .select()
      .from(discounts)
      .where(
        and(
          eq(discounts.userId, userId),
          eq(discounts.isActive, true),
          or(isNull(discounts.startDate), lte(discounts.startDate, now)),
          or(isNull(discounts.endDate), gte(discounts.endDate, now)),
        ),
      )
      .orderBy(discounts.name);
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
    const tier = this.calculateTier(newPoints);

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
    orderAmount?: number,
  ) {
    const program = await this.getLoyaltyByUser(userId);
    if (!program) throw new NotFoundException('Loyalty program not found');

    if (program.points < points) {
      throw new BadRequestException(
        `Insufficient points: have ${program.points}, need ${points}`,
      );
    }

    if (orderAmount !== undefined && orderAmount > 0) {
      const [tenant] = await this.databaseService.db
        .select({ maxPercent: tenantSettings.loyaltyMaxSpendPercent })
        .from(tenantSettings)
        .limit(1);
      const maxPercent = tenant?.maxPercent ?? 20;
      const maxPoints = Math.floor((orderAmount * maxPercent) / 100);
      if (points > maxPoints) {
        throw new BadRequestException(
          `Cannot spend more than ${maxPercent}% of order (${maxPoints} points max)`,
        );
      }
    }

    const newPoints = program.points - points;
    const newTotalSpent = program.totalSpent + points;
    const tier = this.calculateTier(newPoints);

    await this.databaseService.db
      .update(loyaltyPrograms)
      .set({ points: newPoints, totalSpent: newTotalSpent, tier, updatedAt: new Date() })
      .where(eq(loyaltyPrograms.id, program.id));

    await this.databaseService.db.insert(loyaltyTransactions).values({
      programId: program.id,
      orderId,
      type: 'spend',
      points: -points,
      description,
    });

    return { points: newPoints, tier, tierLabel: TIER_LABELS[tier] };
  }

  async earnForCompletedOrder(
    userId: string,
    orderId: string,
    orderAmountRub: number,
  ) {
    if (orderAmountRub <= 0) return null;

    const existing = await this.databaseService.db
      .select({ id: loyaltyTransactions.id })
      .from(loyaltyTransactions)
      .innerJoin(loyaltyPrograms, eq(loyaltyTransactions.programId, loyaltyPrograms.id))
      .where(
        and(
          eq(loyaltyPrograms.userId, userId),
          eq(loyaltyTransactions.orderId, orderId),
          eq(loyaltyTransactions.type, 'earn'),
        ),
      )
      .limit(1);

    if (existing.length) return null;

    const program = await this.ensureLoyaltyProgram(userId);
    const [tenant] = await this.databaseService.db
      .select({ pointsPerRub: tenantSettings.loyaltyPointsPerRub })
      .from(tenantSettings)
      .limit(1);

    const baseRate = tenant?.pointsPerRub
      ? parseFloat(String(tenant.pointsPerRub))
      : 0.1;
    const multiplier = TIER_MULTIPLIERS[program.tier] ?? 1;
    const points = Math.floor(orderAmountRub * baseRate * multiplier);

    if (points <= 0) return null;

    return this.addPoints(
      userId,
      points,
      'earn',
      orderId,
      `Начисление за заказ (${orderAmountRub.toFixed(0)} BYN)`,
    );
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
    points: number,
  ): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (points >= 5000) return 'platinum';
    if (points >= 2000) return 'gold';
    if (points >= 500) return 'silver';
    return 'bronze';
  }
}
