import { relations } from 'drizzle-orm';
import {
  bigint,
  integer,
  numeric,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { orders, sparePartOrders, users } from '../schema';
import { branches } from './branches.model';
import { tenantSettings } from './tenant.model';

export const suppliers = schema.table('Suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contact: varchar('contact', { length: 100 }),
  address: text('address'),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const stores = schema.table('Store', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  location: varchar('location', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  workingHours: varchar('workingHours', { length: 100 }),
  branchId: uuid('branchId').references(() => branches.id),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const categories = schema.table('Categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const spareParts = schema.table('SparePart', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  partNumber: varchar('partNumber').notNull(),
  price: numeric('price').notNull(),
  categoryId: uuid('categoryId')
    .notNull()
    .references(() => categories.id),
  minQuantity: integer('minQuantity').default(0).notNull(),
  supplierId: uuid('supplierId').references(() => suppliers.id),
  reservedQuantity: integer('reservedQuantity').default(0).notNull(),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const stockMovements = schema.table('StockMovements', {
  id: uuid('id').defaultRandom().primaryKey(),
  sparePartId: uuid('sparePartId')
    .notNull()
    .references(() => spareParts.id),
  storeId: uuid('storeId')
    .notNull()
    .references(() => stores.id),
  type: varchar('type').notNull(),
  quantity: bigint('quantity', { mode: 'number' }).notNull(),
  orderId: uuid('orderId').references(() => orders.id),
  userId: uuid('userId').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const sparePartStore = schema.table(
  'SparePart_Store',
  {
    sparePartId: uuid('sparePartId')
      .notNull()
      .references(() => spareParts.id),
    storeId: uuid('storeId')
      .notNull()
      .references(() => stores.id),
    quantity: bigint('quantity', { mode: 'number' }).default(1),
    tenantId: uuid('tenantId').references(() => tenantSettings.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.sparePartId, table.storeId] }),
  })
);

export const positionsForBuying = schema.table('PositionsForBuying', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplierId')
    .notNull()
    .references(() => suppliers.id),
  sparePartId: uuid('sparePartId').references(() => spareParts.id),
  quantity: bigint('quantity', { mode: 'number' }).notNull(),
  deliveryDate: timestamp('deliveryDate', { mode: 'date' })
    .defaultNow()
    .notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const invoices = schema.table('Invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  positionForBuyingId: uuid('positionForBuyingId')
    .notNull()
    .references(() => positionsForBuying.id),
  amount: numeric('amount').notNull(),
  invoiceDate: timestamp('invoiceDate', { mode: 'date' })
    .defaultNow()
    .notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  positionsForBuying: many(positionsForBuying),
}));

export const positionsForBuyingRelations = relations(
  positionsForBuying,
  ({ one, many }) => ({
    supplier: one(suppliers, {
      fields: [positionsForBuying.supplierId],
      references: [suppliers.id],
    }),
    sparePart: one(spareParts, {
      fields: [positionsForBuying.sparePartId],
      references: [spareParts.id],
    }),
    invoices: many(invoices),
  })
);

export const invoicesRelations = relations(invoices, ({ one }) => ({
  positionForBuying: one(positionsForBuying, {
    fields: [invoices.positionForBuyingId],
    references: [positionsForBuying.id],
  }),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  branch: one(branches, {
    fields: [stores.branchId],
    references: [branches.id],
  }),
  sparePartStore: many(sparePartStore),
  stockMovements: many(stockMovements),
}));

export const sparePartsRelations = relations(spareParts, ({ one, many }) => ({
  category: one(categories, {
    fields: [spareParts.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [spareParts.supplierId],
    references: [suppliers.id],
  }),
  sparePartStore: many(sparePartStore),
  sparePartOrders: many(sparePartOrders),
  stockMovements: many(stockMovements),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  sparePart: one(spareParts, {
    fields: [stockMovements.sparePartId],
    references: [spareParts.id],
  }),
  store: one(stores, {
    fields: [stockMovements.storeId],
    references: [stores.id],
  }),
  order: one(orders, {
    fields: [stockMovements.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [stockMovements.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  spareParts: many(spareParts),
}));

export const sparePartStoreRelations = relations(sparePartStore, ({ one }) => ({
  sparePart: one(spareParts, {
    fields: [sparePartStore.sparePartId],
    references: [spareParts.id],
  }),
  store: one(stores, {
    fields: [sparePartStore.storeId],
    references: [stores.id],
  }),
}));
