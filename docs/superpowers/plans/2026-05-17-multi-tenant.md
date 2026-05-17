# Multi-Tenancy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full multi-tenant isolation to every tenant-owned table using a shared schema with `tenantId` column, propagated via `AsyncLocalStorage` through NestJS interceptor and enforced in a `TenantAwareRepository` base class.

**Architecture:** A `TenantContextService` wraps Node's `AsyncLocalStorage`. A `TenantInterceptor` (runs after guards, so `request.user` is already set) calls `tenantCtx.run(tenantId, next)` to bind the tenant for the entire request. All services extend `TenantAwareRepository` which reads the context and injects `.where(eq(table.tenantId, tenantId))` automatically. Public routes without a JWT fall back to the `X-Tenant-ID` request header.

**Tech Stack:** NestJS 10, Drizzle ORM, PostgreSQL, AsyncLocalStorage (Node built-in), drizzle-kit for migrations.

---

## File Map

**New files:**
- `server/src/modules/TenantModule/tenant-context.service.ts` — AsyncLocalStorage wrapper
- `server/src/modules/TenantModule/tenant.interceptor.ts` — sets tenant context per request
- `server/src/modules/database/tenant-aware.repository.ts` — base class for all services

**Modified files:**
- `server/src/modules/AuthModule/types/auth.types.ts` — add `tenantId` to `JwtPayload` + `JwtUser`
- `server/src/modules/AuthModule/strategies/jwt.strategy.ts` — return `tenantId` from `validate()`
- `server/src/modules/AuthModule/auth.service.ts` — include `tenantId` in JWT signing (3 places)
- `server/src/modules/TenantModule/tenant.module.ts` — export `TenantContextService`
- `server/src/app.module.ts` — register `TenantInterceptor` as `APP_INTERCEPTOR`
- `server/src/drizzle/models/auth.model.ts` — add `tenantId` to `users`, `refreshTokens`, `passports`
- `server/src/drizzle/models/staff.model.ts` — add `tenantId` to `employees`, `positions`, `workSchedules`
- `server/src/drizzle/models/inventory.model.ts` — add `tenantId` to `suppliers`, `stores`, `categories`, `spareParts`, `sparePartStore`, `positionsForBuying`, `invoices`
- `server/src/drizzle/models/services.model.ts` — add `tenantId` to `serviceCategories`, `services`
- `server/src/drizzle/models/customers.model.ts` — add `tenantId` to `cars`, `subscriptions`, `reviews`
- `server/src/drizzle/models/orders.model.ts` — add `tenantId` to `orders`, `payments`, `servicesOrders`, `sparePartOrders`
- `server/src/drizzle/models/booking.model.ts` — add `tenantId` to `timeSlots`, `appointments`
- `server/src/drizzle/models/notifications.model.ts` — add `tenantId` to `notificationTemplates`, `notifications`, `notificationChannels`
- `server/src/drizzle/models/diagnostics.model.ts` — add `tenantId` to `diagnosticSessions`, `diagnosticResults`, `maintenanceReminders`
- `server/src/drizzle/models/partners.model.ts` — add `tenantId` to `partners`, `partnerApiKeys`, `partnerSparePartRequests`, `partnerClientRedirects`
- `server/src/drizzle/models/branches.model.ts` — add `tenantId` to `branches`, `branchEmployees`, `storeTransfers`
- `server/src/drizzle/models/warranty.model.ts` — add `tenantId` to `warranties`, `warrantyClaims`
- `server/src/drizzle/models/corporate.model.ts` — add `tenantId` to `companies`, `companyContracts`, `companyCars`
- `server/src/drizzle/models/promotions.model.ts` — add `tenantId` to `discounts`, `orderDiscounts`, `loyaltyPrograms`, `loyaltyTransactions`
- `server/src/drizzle/models/tenant.model.ts` — add `tenantId` to `tenantPages`
- All 18 service files — extend `TenantAwareRepository`, add `tenantWhere()` to queries

---

## Task 1: Update Auth Types

**Files:**
- Modify: `server/src/modules/AuthModule/types/auth.types.ts`

- [ ] **Step 1: Add `tenantId` to `JwtPayload` and `JwtUser`**

Replace the entire file content:

```typescript
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  userId: string;
  email: string;
  roleId: string;
  tenantId: string;
  roleName?: string;
  id?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

export interface ValidatedUser {
  id: string;
  email: string;
  name: string | null;
  surName: string | null;
  phone: string | null;
  roleId: string | null;
  tenantId: string | null;
  login: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/AuthModule/types/auth.types.ts
git commit -m "feat(auth): add tenantId to JWT payload and user types"
```

---

## Task 2: Create TenantContextService

**Files:**
- Create: `server/src/modules/TenantModule/tenant-context.service.ts`

- [ ] **Step 1: Create the service**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface TenantStore {
  tenantId: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantStore>();

  run<T>(tenantId: string, fn: () => T): T {
    return this.storage.run({ tenantId }, fn);
  }

  getTenantId(): string {
    const store = this.storage.getStore();
    if (!store?.tenantId) {
      throw new UnauthorizedException('No tenant context in current request');
    }
    return store.tenantId;
  }

  getTenantIdOrNull(): string | null {
    return this.storage.getStore()?.tenantId ?? null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/TenantModule/tenant-context.service.ts
git commit -m "feat(tenant): add TenantContextService with AsyncLocalStorage"
```

---

## Task 3: Create TenantInterceptor

**Files:**
- Create: `server/src/modules/TenantModule/tenant.interceptor.ts`

- [ ] **Step 1: Create the interceptor**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantCtx: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    // Authenticated requests: tenantId comes from JWT (set by JwtStrategy.validate)
    // Public requests: tenantId comes from X-Tenant-ID header
    const tenantId: string | undefined =
      request.user?.tenantId ?? request.headers['x-tenant-id'];

    if (!tenantId) {
      return next.handle();
    }

    return new Observable(observer => {
      this.tenantCtx.run(tenantId, () => {
        next.handle().subscribe({
          next: val => observer.next(val),
          error: err => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/TenantModule/tenant.interceptor.ts
git commit -m "feat(tenant): add TenantInterceptor to bind AsyncLocalStorage per request"
```

---

## Task 4: Create TenantAwareRepository

**Files:**
- Create: `server/src/modules/database/tenant-aware.repository.ts`

- [ ] **Step 1: Create the base class**

```typescript
import { UnauthorizedException } from '@nestjs/common';
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
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/database/tenant-aware.repository.ts
git commit -m "feat(database): add TenantAwareRepository base class"
```

---

## Task 5: Wire up TenantModule and AppModule

**Files:**
- Modify: `server/src/modules/TenantModule/tenant.module.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Update TenantModule to export TenantContextService**

```typescript
import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantContextService } from './tenant-context.service';
import { TenantInterceptor } from './tenant.interceptor';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantController],
  providers: [TenantService, TenantContextService, TenantInterceptor],
  exports: [TenantService, TenantContextService, TenantInterceptor],
})
export class TenantModule {}
```

- [ ] **Step 2: Register TenantInterceptor globally in AppModule**

In `server/src/app.module.ts`, add to imports at the top:

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantInterceptor } from './modules/TenantModule/tenant.interceptor';
```

Add to the `providers` array (after the existing `APP_GUARD` entry):

```typescript
{
  provide: APP_INTERCEPTOR,
  useClass: TenantInterceptor,
},
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/TenantModule/tenant.module.ts server/src/app.module.ts
git commit -m "feat(tenant): register TenantContextService and TenantInterceptor globally"
```

---

## Task 6: Update JwtStrategy to return tenantId

**Files:**
- Modify: `server/src/modules/AuthModule/strategies/jwt.strategy.ts`

- [ ] **Step 1: Return tenantId from validate()**

Replace the `validate` method body — the full file becomes:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database/database.service';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import type { JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly databaseService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      tenantId: payload.tenantId,
    };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/modules/AuthModule/strategies/jwt.strategy.ts
git commit -m "feat(auth): include tenantId in JWT strategy validate return"
```

---

## Task 7: Include tenantId when signing JWT in AuthService

**Files:**
- Modify: `server/src/modules/AuthModule/auth.service.ts`

- [ ] **Step 1: Find all three places where `jwtService.sign` is called (lines ~148, ~213, ~301) and update the payload**

In `auth.service.ts`, each payload currently looks like:
```typescript
const payload = { email: user.email, sub: user.id, roleId: user.roleId };
```

Change all three occurrences to:
```typescript
const payload = {
  email: user.email,
  sub: user.id,
  roleId: user.roleId,
  tenantId: user.tenantId ?? '',
};
```

> Note: `user.tenantId` will be available after Task 9 adds the column to `users`. Until then, TypeScript may complain — add `// @ts-expect-error until migration` if needed.

- [ ] **Step 2: Also update `ValidatedUser` usage** — the `validateUser` method returns a user from the DB. After Task 9, the `users` table will have `tenantId`. No code change needed there — Drizzle will include it in the returned object automatically.

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/AuthModule/auth.service.ts
git commit -m "feat(auth): include tenantId in JWT signing payload"
```

---

## Task 8: Add tenantId to auth.model.ts

**Files:**
- Modify: `server/src/drizzle/models/auth.model.ts`

The pattern for adding `tenantId` to a table (apply to every table listed):

```typescript
// Add this import at the top if not already present:
import { tenantSettings } from './tenant.model';

// Add this column to the table definition:
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

- [ ] **Step 1: Add tenantId to `users` table**

In `auth.model.ts`, locate the `users` table and add after the last column (before closing `}`):

```typescript
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

- [ ] **Step 2: Add tenantId to `refreshTokens` table**

Same column definition added to `refreshTokens`.

- [ ] **Step 3: Add tenantId to `passports` table**

Same column definition added to `passports`.

- [ ] **Step 4: Verify no circular import** — `auth.model.ts` importing from `tenant.model.ts` is fine since `tenant.model.ts` does not import from `auth.model.ts`.

- [ ] **Step 5: Commit**

```bash
git add server/src/drizzle/models/auth.model.ts
git commit -m "feat(schema): add tenantId to auth tables (users, refreshTokens, passports)"
```

---

## Task 9: Add tenantId to staff.model.ts

**Files:**
- Modify: `server/src/drizzle/models/staff.model.ts`

- [ ] **Step 1: Add import for tenantSettings**

```typescript
import { tenantSettings } from './tenant.model';
```

- [ ] **Step 2: Add `tenantId` column to `positions`, `employees`, `workSchedules`**

```typescript
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

Add to each of the three table definitions.

- [ ] **Step 3: Commit**

```bash
git add server/src/drizzle/models/staff.model.ts
git commit -m "feat(schema): add tenantId to staff tables (positions, employees, workSchedules)"
```

---

## Task 10: Add tenantId to inventory.model.ts

**Files:**
- Modify: `server/src/drizzle/models/inventory.model.ts`

- [ ] **Step 1: Add import for tenantSettings**

```typescript
import { tenantSettings } from './tenant.model';
```

- [ ] **Step 2: Add `tenantId` to `suppliers`, `stores`, `categories`, `spareParts`, `positionsForBuying`, `invoices`**

Add to each table definition:
```typescript
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

- [ ] **Step 3: Add `tenantId` to `sparePartStore` (composite PK table)**

`sparePartStore` uses `primaryKey({ columns: [...] })`. Add `tenantId` as a regular column (not part of PK):

```typescript
export const sparePartStore = schema.table(
  'SparePart_Store',
  {
    sparePartId: uuid('sparePartId').notNull().references(() => spareParts.id),
    storeId: uuid('storeId').notNull().references(() => stores.id),
    quantity: bigint('quantity', { mode: 'number' }).default(1),
    tenantId: uuid('tenantId').references(() => tenantSettings.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.sparePartId, table.storeId] }),
  })
);
```

- [ ] **Step 4: Commit**

```bash
git add server/src/drizzle/models/inventory.model.ts
git commit -m "feat(schema): add tenantId to inventory tables (7 tables)"
```

---

## Task 11: Add tenantId to services, customers, orders models

**Files:**
- Modify: `server/src/drizzle/models/services.model.ts`
- Modify: `server/src/drizzle/models/customers.model.ts`
- Modify: `server/src/drizzle/models/orders.model.ts`

- [ ] **Step 1: services.model.ts** — add import + `tenantId` column to `serviceCategories` and `services`

```typescript
import { tenantSettings } from './tenant.model';
// column to add to each table:
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

- [ ] **Step 2: customers.model.ts** — add `tenantId` to `cars`, `subscriptions`, `reviews`

Same pattern: import + column.

- [ ] **Step 3: orders.model.ts** — add `tenantId` to `orders`, `payments`

For junction tables `servicesOrders` and `sparePartOrders` (which likely have composite PKs), add `tenantId` as a plain column outside the PK definition, same as `sparePartStore` in Task 10.

- [ ] **Step 4: Commit**

```bash
git add server/src/drizzle/models/services.model.ts \
        server/src/drizzle/models/customers.model.ts \
        server/src/drizzle/models/orders.model.ts
git commit -m "feat(schema): add tenantId to services, customers, orders tables"
```

---

## Task 12: Add tenantId to booking, notifications, diagnostics models

**Files:**
- Modify: `server/src/drizzle/models/booking.model.ts`
- Modify: `server/src/drizzle/models/notifications.model.ts`
- Modify: `server/src/drizzle/models/diagnostics.model.ts`

- [ ] **Step 1: booking.model.ts** — add `tenantId` to `timeSlots`, `appointments`

```typescript
import { tenantSettings } from './tenant.model';
// in each table:
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

- [ ] **Step 2: notifications.model.ts** — add `tenantId` to `notificationTemplates`, `notifications`, `notificationChannels`

Same pattern.

- [ ] **Step 3: diagnostics.model.ts** — add `tenantId` to `diagnosticSessions`, `diagnosticResults`, `maintenanceReminders`

> `diagnosticCodesCatalog` is a global catalog — do NOT add `tenantId` to it.

- [ ] **Step 4: Commit**

```bash
git add server/src/drizzle/models/booking.model.ts \
        server/src/drizzle/models/notifications.model.ts \
        server/src/drizzle/models/diagnostics.model.ts
git commit -m "feat(schema): add tenantId to booking, notifications, diagnostics tables"
```

---

## Task 13: Add tenantId to remaining models

**Files:**
- Modify: `server/src/drizzle/models/partners.model.ts`
- Modify: `server/src/drizzle/models/branches.model.ts`
- Modify: `server/src/drizzle/models/warranty.model.ts`
- Modify: `server/src/drizzle/models/corporate.model.ts`
- Modify: `server/src/drizzle/models/promotions.model.ts`
- Modify: `server/src/drizzle/models/tenant.model.ts`

- [ ] **Step 1: partners.model.ts** — add `tenantId` to `partners`, `partnerApiKeys`, `partnerSparePartRequests`, `partnerClientRedirects`

```typescript
import { tenantSettings } from './tenant.model';
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

- [ ] **Step 2: branches.model.ts** — add `tenantId` to `branches`, `branchEmployees`, `storeTransfers`

Same pattern. `branchEmployees` likely has a composite PK — add `tenantId` as plain column outside PK definition.

- [ ] **Step 3: warranty.model.ts** — add `tenantId` to `warranties`, `warrantyClaims`

- [ ] **Step 4: corporate.model.ts** — add `tenantId` to `companies`, `companyContracts`, `companyCars`

`companyCars` likely has composite PK — same treatment as junction tables above.

- [ ] **Step 5: promotions.model.ts** — add `tenantId` to `discounts`, `orderDiscounts`, `loyaltyPrograms`, `loyaltyTransactions`

`orderDiscounts` likely has composite PK — same treatment.

- [ ] **Step 6: tenant.model.ts** — add `tenantId` to `tenantPages` only**

`tenantSettings` itself does NOT get `tenantId` — it IS the tenant.

```typescript
// in tenantPages table only:
tenantId: uuid('tenantId').references(() => tenantSettings.id),
```

- [ ] **Step 7: Commit**

```bash
git add server/src/drizzle/models/partners.model.ts \
        server/src/drizzle/models/branches.model.ts \
        server/src/drizzle/models/warranty.model.ts \
        server/src/drizzle/models/corporate.model.ts \
        server/src/drizzle/models/promotions.model.ts \
        server/src/drizzle/models/tenant.model.ts
git commit -m "feat(schema): add tenantId to partners, branches, warranty, corporate, promotions, tenantPages"
```

---

## Task 14: Generate Drizzle Migration

**Files:**
- Auto-generated under `server/drizzle/migrations/`

- [ ] **Step 1: Check drizzle-kit config exists**

```bash
cat server/drizzle.config.ts 2>/dev/null || cat server/drizzle.config.js 2>/dev/null
```

- [ ] **Step 2: Generate migration**

```bash
cd server && npm run db:generate
```

Expected output: new migration file in `drizzle/migrations/` with `ALTER TABLE ... ADD COLUMN "tenantId" uuid REFERENCES ...` for all 48 tables.

- [ ] **Step 3: Review generated SQL**

Open the generated `.sql` file and verify:
- Each of the 48 tables has `ADD COLUMN "tenantId" uuid`
- Column is NULLABLE (no `NOT NULL` yet — we'll add it after backfill)
- FK references `"autoservice"."TenantSettings"("id")`

- [ ] **Step 4: Commit the migration**

```bash
git add server/drizzle/migrations/
git commit -m "feat(migration): add nullable tenantId column to 48 tables"
```

---

## Task 15: Create Backfill Script and NOT NULL Migration

**Files:**
- Create: `server/src/scripts/tenant-backfill.ts`

- [ ] **Step 1: Create the backfill script**

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const TABLES = [
  'Users', 'RefreshTokens', 'Passports',
  'Employees', 'Positions', 'WorkSchedules',
  'Suppliers', 'Store', 'Categories', 'SparePart', 'SparePart_Store',
  'PositionsForBuying', 'Invoices',
  'ServiceCategories', 'Services',
  'Cars', 'Subscriptions', 'Reviews',
  'Orders', 'Payments', 'ServicesOrders', 'SparePartOrders',
  'TimeSlots', 'Appointments',
  'NotificationTemplates', 'Notifications', 'NotificationChannels',
  'DiagnosticSessions', 'DiagnosticResults', 'MaintenanceReminders',
  'Partners', 'PartnerApiKeys', 'PartnerSparePartRequests', 'PartnerClientRedirects',
  'Branches', 'BranchEmployees', 'StoreTransfers',
  'Warranties', 'WarrantyClaims',
  'Companies', 'CompanyContracts', 'CompanyCars',
  'Discounts', 'OrderDiscounts', 'LoyaltyPrograms', 'LoyaltyTransactions',
  'TenantPages',
];

async function run() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  const db = drizzle(pool);

  // Step 1: Ensure a default tenant exists
  const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
  await db.execute(sql`
    INSERT INTO autoservice."TenantSettings" (id, "companyName", "isSetupComplete")
    VALUES (${DEFAULT_TENANT_ID}, 'Default', true)
    ON CONFLICT (id) DO NOTHING
  `);
  console.log('Default tenant seeded:', DEFAULT_TENANT_ID);

  // Step 2: Backfill all tables
  for (const table of TABLES) {
    const result = await db.execute(sql`
      UPDATE autoservice.${sql.identifier(table)}
      SET "tenantId" = ${DEFAULT_TENANT_ID}
      WHERE "tenantId" IS NULL
    `);
    console.log(`Updated ${table}:`, result.rowCount, 'rows');
  }

  // Step 3: Add NOT NULL constraint and index to all tables
  for (const table of TABLES) {
    await db.execute(sql`
      ALTER TABLE autoservice.${sql.identifier(table)}
      ALTER COLUMN "tenantId" SET NOT NULL
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS ${sql.identifier(`idx_${table}_tenantId`)}
      ON autoservice.${sql.identifier(table)} ("tenantId")
    `);
    console.log(`Constraint + index set for ${table}`);
  }

  await pool.end();
  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add script to package.json**

In `server/package.json`, under `"scripts"`:

```json
"tenant:backfill": "ts-node -r tsconfig-paths/register src/scripts/tenant-backfill.ts"
```

- [ ] **Step 3: Run migration first, then backfill**

```bash
cd server && npm run db:migrate
npm run tenant:backfill
```

Expected: each table prints `Updated X rows`, then `Constraint + index set`.

- [ ] **Step 4: Commit**

```bash
git add server/src/scripts/tenant-backfill.ts server/package.json
git commit -m "feat(migration): add tenant backfill script with NOT NULL + index"
```

---

## Task 16: Refactor SupplierService (reference example)

**Files:**
- Modify: `server/src/modules/SupplierModule/supplier.service.ts`
- Modify: `server/src/modules/SupplierModule/supplier.module.ts`

This task is the reference implementation. All subsequent service tasks follow the same pattern.

- [ ] **Step 1: Update supplier.module.ts to import TenantModule**

```typescript
import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { DatabaseModule } from '../database/database.module';
import { TenantModule } from '../TenantModule/tenant.module';

@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
```

- [ ] **Step 2: Update supplier.service.ts to extend TenantAwareRepository**

Change the class declaration and constructor:

```typescript
import { TenantAwareRepository } from '../database/tenant-aware.repository';
import { TenantContextService } from '../TenantModule/tenant-context.service';

@Injectable()
export class SupplierService extends TenantAwareRepository {
  constructor(
    databaseService: DatabaseService,
    tenantCtx: TenantContextService,
  ) {
    super(databaseService, tenantCtx);
  }
```

- [ ] **Step 3: Add tenant filter to every query in the service**

For every `select()`, `update()`, `delete()` that touches a tenant-owned table, chain `.where(this.tenantWhere(tableName))`.

Example — `findAll()`:
```typescript
// Before
let baseQuery = this.databaseService.db.select().from(suppliers);

// After
let baseQuery = this.databaseService.db
  .select()
  .from(suppliers)
  .where(this.tenantWhere(suppliers));
```

For `insert()`, add `tenantId` to the values object:
```typescript
// Before
.values({ name: ..., contact: ..., address: ... })

// After
.values({ name: ..., contact: ..., address: ..., tenantId: this.tenantId })
```

Apply this pattern to all methods: `findAll`, `findById`, `create`, `update`, `delete`, `getInvoicesByPosition`, `getInvoiceById`, `createInvoice`, `updateInvoice`, `deleteInvoice`.

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/SupplierModule/
git commit -m "feat(supplier): extend TenantAwareRepository, add tenant filtering"
```

---

## Task 17: Refactor ServiceService

**Files:**
- Modify: `server/src/modules/ServiceModule/service.service.ts`
- Modify: `server/src/modules/ServiceModule/service.module.ts`

- [ ] **Step 1: Add TenantModule to service.module.ts imports** (same as Task 16 Step 1 pattern)

- [ ] **Step 2: Extend TenantAwareRepository in service.service.ts** (same as Task 16 Step 2 pattern)

- [ ] **Step 3: Add tenant filter + tenantId to all queries**

Apply to: `findAll`, `findById`, `create`, `update`, `delete`, `findAllCategories`, `findCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`.

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/ServiceModule/
git commit -m "feat(service): extend TenantAwareRepository, add tenant filtering"
```

---

## Task 18: Refactor Remaining Services

**Files:** (each module's `.service.ts` and `.module.ts`)

Apply the same pattern from Task 16 to all remaining services:

| Module | Service file | Tables to filter |
|--------|-------------|-----------------|
| AuthModule | `auth.service.ts` | `users` (login query — skip tenant filter, but `create` needs `tenantId`) |
| UserModule | `user.service.ts` | `users`, `roles`, `passports`, `orders`, `cars`, `reviews`, `subscriptions` |
| VehicleModule | `vehicle.service.ts` | `cars` |
| BookingModule | `booking.service.ts` | `appointments`, `timeSlots`, `cars` |
| OrderModule | `order.service.ts` | `orders`, `servicesOrders`, `services`, `sparePartOrders`, `spareParts` |
| WarrantyModule | `warranty.service.ts` | `warranties`, `warrantyClaims` |
| DiagnosticsModule | `diagnostics.service.ts` | `diagnosticSessions`, `diagnosticResults`, `maintenanceReminders` |
| SpareModule | `spare.service.ts` | `sparePartStore`, `spareParts`, `stores`, `categories` |
| BranchModule | `branch.service.ts` | `branches`, `branchEmployees`, `storeTransfers` |
| EmployeeModule | `employee.service.ts` | `employees`, `positions`, `workSchedules` |
| CorporateModule | `corporate.service.ts` | `companies`, `companyContracts`, `companyCars` |
| PartnersModule | `partners.service.ts` | `partners`, `partnerApiKeys`, `partnerSparePartRequests`, `partnerClientRedirects` |
| PromotionsModule | `promotions.service.ts` | `discounts`, `orderDiscounts`, `loyaltyPrograms`, `loyaltyTransactions` |
| NotificationModule | `notification.service.ts` + scheduled services | `notifications`, `notificationTemplates`, `notificationChannels` |
| AnalyticsModule | `analytics.service.ts` | `orders`, `payments`, `appointments`, `employees`, `reviews` |
| ScheduleModule | `schedule.service.ts` | `orders`, `employees`, `workSchedules` |

> **AuthModule special case:** The `validateUser()` and `login()` queries look up users by email without a tenant context (the user doesn't have a token yet). These queries must NOT use `tenantWhere()`. Only user creation needs `tenantId`.

For each module:
- [ ] Add `TenantModule` to module imports
- [ ] Extend `TenantAwareRepository`  
- [ ] Add `this.tenantWhere(table)` to every `select`/`update`/`delete`
- [ ] Add `tenantId: this.tenantId` to every `insert().values()`
- [ ] Commit per module: `feat(<module>): extend TenantAwareRepository, add tenant filtering`

---

## Task 19: Update TenantModule to Inject TenantContextService into Other Modules

**Files:**
- Modify: `server/src/modules/database/database.module.ts`

- [ ] **Step 1: Check if DatabaseModule exports DatabaseService**

```bash
cat server/src/modules/database/database.module.ts
```

If `DatabaseService` is already exported, no change needed. Each module that imports `DatabaseModule` will also need `TenantModule` for `TenantContextService` — which is handled per-module in Tasks 16–18.

- [ ] **Step 2: Verify the app builds**

```bash
cd server && npm run build
```

Expected: no TypeScript errors. Fix any remaining type errors (likely missing `tenantId` in DTO types or schema mismatches).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors after multi-tenant refactor"
```

---

## Task 20: Smoke Test

- [ ] **Step 1: Start the server**

```bash
cd server && npm run start:dev
```

Expected: server starts on port 3000 with no errors.

- [ ] **Step 2: Test unauthenticated public route with X-Tenant-ID header**

```bash
curl -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001" \
     http://localhost:3000/api/v1.0/services
```

Expected: `200 OK` with services array (filtered to the default tenant).

- [ ] **Step 3: Test login and verify tenantId in JWT**

```bash
curl -X POST http://localhost:3000/api/v1.0/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

Decode the returned `accessToken` at [jwt.io](https://jwt.io) and verify `tenantId` field is present.

- [ ] **Step 4: Test authenticated route — results should be tenant-scoped**

```bash
curl -H "Authorization: Bearer <token_from_step3>" \
     http://localhost:3000/api/v1.0/supplier
```

Expected: `200 OK` with only suppliers belonging to the user's tenant.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete multi-tenant implementation (shared schema + AsyncLocalStorage)"
```
