import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { warranties, warrantyClaims } from '../database/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

@Injectable()
export class WarrantyService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: {
    orderId: string;
    sparePartId?: string;
    type: 'work' | 'spare_part' | 'complex';
    description?: string;
    durationMonths: number;
  }) {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt);
    expiresAt.setMonth(expiresAt.getMonth() + data.durationMonths);

    const [created] = await this.databaseService.db
      .insert(warranties)
      .values({ ...data, issuedAt, expiresAt })
      .returning();
    return created;
  }

  async findByOrder(orderId: string) {
    return this.databaseService.db
      .select()
      .from(warranties)
      .where(eq(warranties.orderId, orderId));
  }

  async findById(id: string) {
    const [warranty] = await this.databaseService.db
      .select()
      .from(warranties)
      .where(eq(warranties.id, id))
      .limit(1);

    if (!warranty) throw new NotFoundException(`Warranty ${id} not found`);
    return warranty;
  }

  async findActive() {
    return this.databaseService.db
      .select()
      .from(warranties)
      .where(
        and(
          eq(warranties.status, 'active'),
          gte(warranties.expiresAt, new Date()),
        ),
      )
      .orderBy(warranties.expiresAt);
  }

  async updateStatus(
    id: string,
    status: 'active' | 'expired' | 'claimed' | 'voided',
  ) {
    const [updated] = await this.databaseService.db
      .update(warranties)
      .set({ status })
      .where(eq(warranties.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Warranty ${id} not found`);
    return updated;
  }

  // Warranty Claims
  async createClaim(data: {
    warrantyId: string;
    userId: string;
    description: string;
  }) {
    const warranty = await this.findById(data.warrantyId);

    if (warranty.status !== 'active') {
      throw new BadRequestException(
        `Warranty is ${warranty.status}, cannot file a claim`,
      );
    }

    if (warranty.expiresAt < new Date()) {
      throw new BadRequestException('Warranty has expired');
    }

    const [claim] = await this.databaseService.db
      .insert(warrantyClaims)
      .values(data)
      .returning();
    return claim;
  }

  async updateClaimStatus(
    claimId: string,
    status: 'under_review' | 'approved' | 'rejected' | 'resolved',
    resolution?: string,
  ) {
    const [updated] = await this.databaseService.db
      .update(warrantyClaims)
      .set({
        status,
        resolution,
        resolvedAt: ['approved', 'rejected', 'resolved'].includes(status)
          ? new Date()
          : undefined,
      })
      .where(eq(warrantyClaims.id, claimId))
      .returning();

    if (!updated) throw new NotFoundException(`Claim ${claimId} not found`);
    return updated;
  }

  async getClaims(warrantyId?: string) {
    let query = this.databaseService.db.select().from(warrantyClaims);
    if (warrantyId) {
      query = query.where(eq(warrantyClaims.warrantyId, warrantyId)) as any;
    }
    return (query as any).orderBy(desc(warrantyClaims.createdAt));
  }

  async getUserClaims(userId: string) {
    return this.databaseService.db
      .select()
      .from(warrantyClaims)
      .where(eq(warrantyClaims.userId, userId))
      .orderBy(desc(warrantyClaims.createdAt));
  }
}
