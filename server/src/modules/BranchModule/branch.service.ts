import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  branches,
  branchEmployees,
  storeTransfers,
} from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class BranchService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(activeOnly = true) {
    const query = this.databaseService.db.select().from(branches).$dynamic();
    if (activeOnly) {
      query.where(eq(branches.isActive, true));
    }
    return query.orderBy(branches.name);
  }

  async findById(id: string) {
    const [branch] = await this.databaseService.db
      .select()
      .from(branches)
      .where(eq(branches.id, id))
      .limit(1);

    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    return branch;
  }

  async create(data: {
    name: string;
    address: string;
    city?: string;
    phone?: string;
    email?: string;
    managerId?: string;
    workingHours?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(branches)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      city: string;
      phone: string;
      email: string;
      managerId: string;
      workingHours: string;
      isActive: boolean;
    }>,
  ) {
    const [updated] = await this.databaseService.db
      .update(branches)
      .set(data)
      .where(eq(branches.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Branch ${id} not found`);
    return updated;
  }

  // Branch employees
  async assignEmployee(branchId: string, employeeId: string, isPrimary = false) {
    const [created] = await this.databaseService.db
      .insert(branchEmployees)
      .values({ branchId, employeeId, isPrimary })
      .onConflictDoUpdate({
        target: [branchEmployees.branchId, branchEmployees.employeeId],
        set: { isPrimary },
      })
      .returning();
    return created;
  }

  async removeEmployee(branchId: string, employeeId: string) {
    await this.databaseService.db
      .delete(branchEmployees)
      .where(
        and(
          eq(branchEmployees.branchId, branchId),
          eq(branchEmployees.employeeId, employeeId),
        ),
      );
  }

  async getBranchEmployees(branchId: string) {
    return this.databaseService.db
      .select()
      .from(branchEmployees)
      .where(eq(branchEmployees.branchId, branchId));
  }

  // Store transfers
  async createTransfer(data: {
    fromStoreId: string;
    toStoreId: string;
    sparePartId: string;
    quantity: number;
    initiatedById?: string;
    notes?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(storeTransfers)
      .values(data)
      .returning();
    return created;
  }

  async updateTransferStatus(
    transferId: string,
    status: 'in_transit' | 'completed' | 'cancelled',
  ) {
    const [updated] = await this.databaseService.db
      .update(storeTransfers)
      .set({
        status,
        completedAt: status === 'completed' ? new Date() : undefined,
      })
      .where(eq(storeTransfers.id, transferId))
      .returning();

    if (!updated) throw new NotFoundException(`Transfer ${transferId} not found`);
    return updated;
  }

  async getTransfers(fromStoreId?: string) {
    const query = this.databaseService.db.select().from(storeTransfers).$dynamic();
    if (fromStoreId) {
      query.where(eq(storeTransfers.fromStoreId, fromStoreId));
    }
    return query.orderBy(desc(storeTransfers.createdAt));
  }
}
