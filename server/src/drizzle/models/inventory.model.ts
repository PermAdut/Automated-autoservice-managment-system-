import { relations } from 'drizzle-orm';
import {
  bigint,
  numeric,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { sparePartOrders } from '../schema';

export const suppliers = schema.table('Suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contact: varchar('contact', { length: 100 }),
  address: text('address'),
});

export const stores = schema.table('Store', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  location: varchar('location', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  workingHours: varchar('workingHours', { length: 100 }),
});

export const categories = schema.table('Categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
});

export const spareParts = schema.table('SparePart', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  partNumber: varchar('partNumber').notNull(),
  price: numeric('price').notNull(),
  categoryId: uuid('categoryId')
    .notNull()
    .references(() => categories.id),
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
  quantity: bigint('quantity', { mode: 'number' }).notNull(),
  deliveryDate: timestamp('deliveryDate', { mode: 'date' })
    .defaultNow()
    .notNull(),
  status: varchar('status', { length: 20 }).notNull(),
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
    invoices: many(invoices),
  })
);

export const invoicesRelations = relations(invoices, ({ one }) => ({
  positionForBuying: one(positionsForBuying, {
    fields: [invoices.positionForBuyingId],
    references: [positionsForBuying.id],
  }),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  sparePartStore: many(sparePartStore),
}));

export const sparePartsRelations = relations(spareParts, ({ one, many }) => ({
  category: one(categories, {
    fields: [spareParts.categoryId],
    references: [categories.id],
  }),
  sparePartStore: many(sparePartStore),
  sparePartOrders: many(sparePartOrders),
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
