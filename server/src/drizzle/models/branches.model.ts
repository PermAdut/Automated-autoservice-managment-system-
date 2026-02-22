import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { employees, spareParts, stores, users } from '../schema';

export const transferStatusEnum = schema.enum('transfer_status', [
  'pending',
  'in_transit',
  'completed',
  'cancelled',
]);

export const branches = schema.table(
  'Branches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    address: text('address').notNull(),
    city: varchar('city', { length: 100 }),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 100 }),
    managerId: uuid('managerId').references(() => users.id),
    workingHours: varchar('workingHours', { length: 100 }),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    cityIdx: index('branch_city_idx').on(table.city),
    isActiveIdx: index('branch_active_idx').on(table.isActive),
  })
);

export const branchEmployees = schema.table(
  'BranchEmployees',
  {
    branchId: uuid('branchId')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),
    employeeId: uuid('employeeId')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assignedAt', { mode: 'date' }).defaultNow().notNull(),
    isPrimary: boolean('isPrimary').default(false).notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.branchId, table.employeeId] }),
  })
);

export const storeTransfers = schema.table(
  'StoreTransfers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fromStoreId: uuid('fromStoreId')
      .notNull()
      .references(() => stores.id),
    toStoreId: uuid('toStoreId')
      .notNull()
      .references(() => stores.id),
    sparePartId: uuid('sparePartId')
      .notNull()
      .references(() => spareParts.id),
    quantity: integer('quantity').notNull(),
    status: transferStatusEnum('status').notNull().default('pending'),
    initiatedById: uuid('initiatedById').references(() => users.id),
    notes: text('notes'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    completedAt: timestamp('completedAt', { mode: 'date' }),
  },
  table => ({
    fromStoreIdx: index('transfer_from_store_idx').on(table.fromStoreId),
    statusIdx: index('transfer_status_idx').on(table.status),
  })
);

export const branchesRelations = relations(branches, ({ one, many }) => ({
  manager: one(users, {
    fields: [branches.managerId],
    references: [users.id],
  }),
  branchEmployees: many(branchEmployees),
}));

export const branchEmployeesRelations = relations(
  branchEmployees,
  ({ one }) => ({
    branch: one(branches, {
      fields: [branchEmployees.branchId],
      references: [branches.id],
    }),
    employee: one(employees, {
      fields: [branchEmployees.employeeId],
      references: [employees.id],
    }),
  })
);

export const storeTransfersRelations = relations(
  storeTransfers,
  ({ one }) => ({
    fromStore: one(stores, {
      fields: [storeTransfers.fromStoreId],
      references: [stores.id],
      relationName: 'fromStore',
    }),
    toStore: one(stores, {
      fields: [storeTransfers.toStoreId],
      references: [stores.id],
      relationName: 'toStore',
    }),
    sparePart: one(spareParts, {
      fields: [storeTransfers.sparePartId],
      references: [spareParts.id],
    }),
    initiatedBy: one(users, {
      fields: [storeTransfers.initiatedById],
      references: [users.id],
    }),
  })
);
