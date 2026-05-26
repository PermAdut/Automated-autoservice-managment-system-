import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { syncLog } from '../database/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class SyncService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByUser(userId: string, limit = 50) {
    return this.databaseService.db
      .select()
      .from(syncLog)
      .where(eq(syncLog.userId, userId))
      .orderBy(desc(syncLog.syncedAt))
      .limit(limit);
  }

  async createEntry(
    userId: string,
    data: {
      operation: string;
      entity: string;
      entityId: string;
      status: string;
      error?: string;
    },
  ) {
    const [created] = await this.databaseService.db
      .insert(syncLog)
      .values({
        userId,
        operation: data.operation,
        entity: data.entity,
        entityId: data.entityId,
        status: data.status,
        error: data.error,
      })
      .returning();
    return created;
  }
}
