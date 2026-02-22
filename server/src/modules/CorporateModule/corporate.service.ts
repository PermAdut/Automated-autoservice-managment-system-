import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { companies, companyContracts, companyCars } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class CorporateService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Companies
  async findAll() {
    return this.databaseService.db
      .select()
      .from(companies)
      .orderBy(companies.name);
  }

  async findById(id: string) {
    const [company] = await this.databaseService.db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }

  async create(data: {
    name: string;
    inn?: string;
    address?: string;
    city?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    managerUserId?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(companies)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      inn: string;
      address: string;
      city: string;
      contactPerson: string;
      phone: string;
      email: string;
      managerUserId: string;
      isActive: boolean;
    }>,
  ) {
    const [updated] = await this.databaseService.db
      .update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Company ${id} not found`);
    return updated;
  }

  // Contracts
  async getContracts(companyId: string) {
    return this.databaseService.db
      .select()
      .from(companyContracts)
      .where(eq(companyContracts.companyId, companyId))
      .orderBy(desc(companyContracts.createdAt));
  }

  async createContract(data: {
    companyId: string;
    contractNumber?: string;
    discountPercent?: string;
    creditLimit?: string;
    paymentTermDays?: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(companyContracts)
      .values({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      })
      .returning();
    return created;
  }

  async updateContractStatus(
    contractId: string,
    status: 'draft' | 'active' | 'suspended' | 'expired' | 'terminated',
  ) {
    const [updated] = await this.databaseService.db
      .update(companyContracts)
      .set({ status })
      .where(eq(companyContracts.id, contractId))
      .returning();

    if (!updated)
      throw new NotFoundException(`Contract ${contractId} not found`);
    return updated;
  }

  // Company cars
  async addCar(companyId: string, carId: string, notes?: string) {
    const [created] = await this.databaseService.db
      .insert(companyCars)
      .values({ companyId, carId, notes })
      .onConflictDoNothing()
      .returning();
    return created;
  }

  async removeCar(companyId: string, carId: string) {
    await this.databaseService.db
      .delete(companyCars)
      .where(
        and(eq(companyCars.companyId, companyId), eq(companyCars.carId, carId)),
      );
  }

  async getCompanyCars(companyId: string) {
    return this.databaseService.db
      .select()
      .from(companyCars)
      .where(eq(companyCars.companyId, companyId));
  }
}
