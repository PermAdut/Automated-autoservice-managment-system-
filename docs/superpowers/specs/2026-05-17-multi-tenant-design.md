# Multi-Tenancy Design — Shared Schema + tenantId + AsyncLocalStorage

## Overview

Add full multi-tenant support to the AutoService Management System using the shared-schema approach: every tenant-owned table gets a `tenantId` column, tenant context is propagated via `AsyncLocalStorage`, and a `TenantAwareRepository` base class automatically injects the tenant filter into all Drizzle queries.

**Approach chosen:** Variant B — Shared schema + tenantId + AsyncLocalStorage  
**Rejected alternatives:**
- Separate PostgreSQL schemas per tenant — doesn't scale, Drizzle migrations don't support dynamic schemas
- RLS + SET LOCAL — blocked by PgBouncer `POOL_MODE=transaction` (session vars reset between transactions)

---

## Tables

### Tables that receive `tenantId uuid NOT NULL references TenantSettings(id)`

All tables that store data belonging to a specific auto-service installation:

**Auth:** `users`, `refreshTokens`, `passports`  
**Staff:** `employees`, `positions`, `workSchedules`  
**Inventory:** `suppliers`, `stores`, `categories`, `spareParts`, `sparePartStore`, `positionsForBuying`, `invoices`  
**Services:** `serviceCategories`, `services`  
**Customers:** `cars`, `subscriptions`, `reviews`  
**Orders:** `orders`, `payments`, `servicesOrders`, `sparePartOrders`  
**Booking:** `timeSlots`, `appointments`  
**Notifications:** `notificationTemplates`, `notifications`, `notificationChannels`  
**Diagnostics:** `diagnosticSessions`, `diagnosticResults`, `maintenanceReminders`  
**Partners:** `partners`, `partnerApiKeys`, `partnerSparePartRequests`, `partnerClientRedirects`  
**Branches:** `branches`, `branchEmployees`, `storeTransfers`  
**Warranty:** `warranties`, `warrantyClaims`  
**Corporate:** `companies`, `companyContracts`, `companyCars`  
**Promotions:** `discounts`, `orderDiscounts`, `loyaltyPrograms`, `loyaltyTransactions`  
**Tenant:** `tenantPages`

**Total: 48 tables**

### Tables that do NOT receive `tenantId` (global / system-wide)

| Table | Reason |
|-------|--------|
| `TenantSettings` | This IS the tenant — source of truth for `tenantId` |
| `roles` | System-wide roles (`admin`, `manager`, `mechanic`) |
| `diagnosticCodesCatalog` | OBD-II DTC codes — international standard, shared across all tenants |

---

## Architecture

### Tenant Context Propagation

```
HTTP Request
  └─ Authorization: Bearer <JWT>
       │  JWT payload: { sub, role, tenantId }
       │
  JwtAuthGuard (existing — extend to extract tenantId)
       │
  TenantContextService.setTenantId(tenantId)
       │  AsyncLocalStorage<{ tenantId: string }>
       │
  Any NestJS service in the request scope
       │  TenantContextService.getTenantId()
       │
  TenantAwareRepository
       │  automatically appends .where(eq(table.tenantId, tenantId))
       ▼
  Drizzle query → PostgreSQL
```

### New Files

```
server/src/
├── modules/
│   ├── TenantModule/
│   │   └── tenant-context.service.ts     ← AsyncLocalStorage wrapper
│   └── database/
│       └── tenant-aware.repository.ts    ← base class for all services
```

### TenantContextService

```ts
@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<{ tenantId: string }>();

  run<T>(tenantId: string, fn: () => T): T {
    return this.storage.run({ tenantId }, fn);
  }

  getTenantId(): string {
    const store = this.storage.getStore();
    if (!store) throw new UnauthorizedException('No tenant context');
    return store.tenantId;
  }
}
```

### TenantAwareRepository

```ts
export abstract class TenantAwareRepository {
  constructor(
    protected readonly db: DatabaseService,
    protected readonly tenantCtx: TenantContextService,
  ) {}

  protected get tenantId(): string {
    return this.tenantCtx.getTenantId();
  }

  protected tenantWhere<T extends Record<string, unknown> & { tenantId: PgColumn }>(
    table: T,
  ) {
    return eq(table.tenantId, this.tenantId);
  }
}
```

### JwtAuthGuard Extension

The existing `JwtAuthGuard` is extended to call `tenantContextService.run(tenantId, next)` after JWT validation, wrapping the request handler so that `AsyncLocalStorage` is active for the entire request lifecycle.

---

## Migration Strategy

Safe 4-step migration to avoid breaking existing data:

**Step 1 — Add nullable column**
```sql
ALTER TABLE "autoservice"."Users" ADD COLUMN "tenantId" uuid REFERENCES "autoservice"."TenantSettings"(id);
-- (repeat for all 48 tables)
```

**Step 2 — Seed default tenant**
```sql
INSERT INTO "autoservice"."TenantSettings" (id, "companyName", "isSetupComplete")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default', true);
```

**Step 3 — Backfill existing rows**
```sql
UPDATE "autoservice"."Users" SET "tenantId" = '00000000-0000-0000-0000-000000000001' WHERE "tenantId" IS NULL;
-- (repeat for all 48 tables)
```

**Step 4 — Add NOT NULL + indexes**
```sql
ALTER TABLE "autoservice"."Users" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX ON "autoservice"."Users"("tenantId");
-- (repeat for all 48 tables)
```

In Drizzle schema: initially declare column without `.notNull()`, run step 1–3, then add `.notNull()` and generate a second migration for step 4.

---

## JWT Token Changes

`tenantId` must be included in the JWT payload at login:

```ts
// AuthService.login()
const payload = {
  sub: user.id,
  role: user.role,
  tenantId: user.tenantId,  // ← add this
};
```

---

## Service Migration Pattern

All existing services are refactored to extend `TenantAwareRepository`:

```ts
// Before
@Injectable()
export class SupplierService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.db.select().from(suppliers);
  }
}

// After
@Injectable()
export class SupplierService extends TenantAwareRepository {
  constructor(db: DatabaseService, tenantCtx: TenantContextService) {
    super(db, tenantCtx);
  }

  async findAll() {
    return this.db.db
      .select()
      .from(suppliers)
      .where(this.tenantWhere(suppliers));
  }
}
```

---

## Scope & Exclusions

**In scope:**
- Schema changes (48 tables)
- Migration scripts (4-step)
- TenantContextService + TenantAwareRepository
- JwtAuthGuard extension
- Refactor of all 18 existing services

**Out of scope:**
- Tenant registration / onboarding flow (separate feature)
- Cross-tenant analytics for super-admin (separate feature)
- Frontend changes
