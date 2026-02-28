import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  partners,
  partnerApiKeys,
  partnerSparePartRequests,
  partnerClientRedirects,
} from '../database/schema';
import { eq, desc } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class PartnersService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Partners CRUD
  async findAll(status?: string) {
    let query = this.databaseService.db.select().from(partners);
    if (status) {
      query = query.where(eq(partners.status, status as any)) as any;
    }
    return (query as any).orderBy(desc(partners.createdAt));
  }

  async findById(id: string) {
    const [partner] = await this.databaseService.db
      .select()
      .from(partners)
      .where(eq(partners.id, id))
      .limit(1);

    if (!partner) throw new NotFoundException(`Partner ${id} not found`);
    return partner;
  }

  async create(data: {
    name: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    apiUrl?: string;
    description?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(partners)
      .values(data)
      .returning();
    return created;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      status: 'active' | 'pending' | 'suspended' | 'inactive';
      address: string;
      city: string;
      phone: string;
      email: string;
      website: string;
      apiUrl: string;
      description: string;
    }>,
  ) {
    const [updated] = await this.databaseService.db
      .update(partners)
      .set(data)
      .where(eq(partners.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Partner ${id} not found`);
    return updated;
  }

  // API Keys
  async generateApiKey(partnerId: string, name?: string, scopes?: string) {
    await this.findById(partnerId);

    const rawKey = randomBytes(32).toString('hex');
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const [created] = await this.databaseService.db
      .insert(partnerApiKeys)
      .values({ partnerId, keyHash, name, scopes })
      .returning();

    // Return the raw key only once — it won't be retrievable after
    return { ...created, rawKey };
  }

  async getApiKeys(partnerId: string) {
    return this.databaseService.db
      .select({
        id: partnerApiKeys.id,
        name: partnerApiKeys.name,
        scopes: partnerApiKeys.scopes,
        isActive: partnerApiKeys.isActive,
        lastUsedAt: partnerApiKeys.lastUsedAt,
        expiresAt: partnerApiKeys.expiresAt,
        createdAt: partnerApiKeys.createdAt,
      })
      .from(partnerApiKeys)
      .where(eq(partnerApiKeys.partnerId, partnerId));
  }

  async revokeApiKey(keyId: string) {
    const [updated] = await this.databaseService.db
      .update(partnerApiKeys)
      .set({ isActive: false })
      .where(eq(partnerApiKeys.id, keyId))
      .returning();

    if (!updated) throw new NotFoundException(`API key ${keyId} not found`);
    return updated;
  }

  // Spare part requests between partners
  async createPartRequest(data: {
    fromPartnerId: string;
    toPartnerId: string;
    sparePartId: string;
    quantity?: number;
    notes?: string;
  }) {
    if (data.fromPartnerId === data.toPartnerId) {
      throw new BadRequestException('Cannot request from yourself');
    }

    const [created] = await this.databaseService.db
      .insert(partnerSparePartRequests)
      .values(data)
      .returning();
    return created;
  }

  async updatePartRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected' | 'transferred' | 'cancelled',
  ) {
    const [updated] = await this.databaseService.db
      .update(partnerSparePartRequests)
      .set({
        status,
        resolvedAt: ['approved', 'rejected', 'transferred', 'cancelled'].includes(status)
          ? new Date()
          : undefined,
      })
      .where(eq(partnerSparePartRequests.id, requestId))
      .returning();

    if (!updated) throw new NotFoundException(`Request ${requestId} not found`);
    return updated;
  }

  async getPartRequests(partnerId: string) {
    return this.databaseService.db
      .select()
      .from(partnerSparePartRequests)
      .where(eq(partnerSparePartRequests.fromPartnerId, partnerId))
      .orderBy(desc(partnerSparePartRequests.requestedAt));
  }

  // Client redirects
  async createClientRedirect(data: {
    userId: string;
    fromPartnerId: string;
    toPartnerId: string;
    reason?: string;
    serviceRequested?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(partnerClientRedirects)
      .values(data)
      .returning();
    return created;
  }
}
