import { eq } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { DatabaseService } from './database.service';
import { TenantContextService } from '../TenantModule/tenant-context.service';

export abstract class TenantAwareRepository {
  constructor(
    protected readonly databaseService: DatabaseService,
    protected readonly tenantCtx: TenantContextService,
  ) {}

  protected get tenantId(): string {
    return this.tenantCtx.getTenantId();
  }

  protected tenantWhere(table: { tenantId: PgColumn }) {
    return eq(table.tenantId, this.tenantId);
  }
}
