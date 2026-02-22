import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { orders, users } from '../schema';

export const discountTypeEnum = schema.enum('discount_type', [
  'percent',
  'fixed',
  'free_service',
]);

export const loyaltyTierEnum = schema.enum('loyalty_tier', [
  'bronze',
  'silver',
  'gold',
  'platinum',
]);

export const loyaltyTxTypeEnum = schema.enum('loyalty_tx_type', [
  'earn',
  'spend',
  'bonus',
  'expire',
  'adjustment',
]);

export const discounts = schema.table(
  'Discounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 50 }).unique(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    type: discountTypeEnum('type').notNull(),
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: numeric('minOrderAmount', { precision: 10, scale: 2 }),
    maxUsageCount: integer('maxUsageCount'),
    usedCount: integer('usedCount').default(0).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    startDate: timestamp('startDate', { mode: 'date' }),
    endDate: timestamp('endDate', { mode: 'date' }),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    codeIdx: index('discount_code_idx').on(table.code),
    isActiveIdx: index('discount_active_idx').on(table.isActive),
    endDateIdx: index('discount_end_date_idx').on(table.endDate),
  })
);

export const orderDiscounts = schema.table(
  'OrderDiscounts',
  {
    orderId: uuid('orderId')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    discountId: uuid('discountId')
      .notNull()
      .references(() => discounts.id),
    appliedAmount: numeric('appliedAmount', { precision: 10, scale: 2 }).notNull(),
    appliedAt: timestamp('appliedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.orderId, table.discountId] }),
  })
);

export const loyaltyPrograms = schema.table(
  'LoyaltyPrograms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    points: integer('points').default(0).notNull(),
    tier: loyaltyTierEnum('tier').notNull().default('bronze'),
    totalEarned: integer('totalEarned').default(0).notNull(),
    totalSpent: integer('totalSpent').default(0).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    userIdx: index('loyalty_user_idx').on(table.userId),
    tierIdx: index('loyalty_tier_idx').on(table.tier),
  })
);

export const loyaltyTransactions = schema.table(
  'LoyaltyTransactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    programId: uuid('programId')
      .notNull()
      .references(() => loyaltyPrograms.id, { onDelete: 'cascade' }),
    orderId: uuid('orderId').references(() => orders.id),
    type: loyaltyTxTypeEnum('type').notNull(),
    points: integer('points').notNull(),
    description: varchar('description', { length: 500 }),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    programIdx: index('loyalty_tx_program_idx').on(table.programId),
    createdAtIdx: index('loyalty_tx_created_at_idx').on(table.createdAt),
  })
);

export const discountsRelations = relations(discounts, ({ many }) => ({
  orderDiscounts: many(orderDiscounts),
}));

export const orderDiscountsRelations = relations(orderDiscounts, ({ one }) => ({
  order: one(orders, {
    fields: [orderDiscounts.orderId],
    references: [orders.id],
  }),
  discount: one(discounts, {
    fields: [orderDiscounts.discountId],
    references: [discounts.id],
  }),
}));

export const loyaltyProgramsRelations = relations(
  loyaltyPrograms,
  ({ one, many }) => ({
    user: one(users, {
      fields: [loyaltyPrograms.userId],
      references: [users.id],
    }),
    transactions: many(loyaltyTransactions),
  })
);

export const loyaltyTransactionsRelations = relations(
  loyaltyTransactions,
  ({ one }) => ({
    program: one(loyaltyPrograms, {
      fields: [loyaltyTransactions.programId],
      references: [loyaltyPrograms.id],
    }),
    order: one(orders, {
      fields: [loyaltyTransactions.orderId],
      references: [orders.id],
    }),
  })
);
