import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { orders, spareParts, users } from '../schema';

export const warrantyTypeEnum = schema.enum('warranty_type', [
  'work',
  'spare_part',
  'complex',
]);

export const warrantyStatusEnum = schema.enum('warranty_status', [
  'active',
  'expired',
  'claimed',
  'voided',
]);

export const warrantyClaimStatusEnum = schema.enum('warranty_claim_status', [
  'open',
  'under_review',
  'approved',
  'rejected',
  'resolved',
]);

export const warranties = schema.table(
  'Warranties',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('orderId')
      .notNull()
      .references(() => orders.id),
    sparePartId: uuid('sparePartId').references(() => spareParts.id),
    type: warrantyTypeEnum('type').notNull(),
    status: warrantyStatusEnum('status').notNull().default('active'),
    description: text('description'),
    durationMonths: integer('durationMonths').notNull(),
    issuedAt: timestamp('issuedAt', { mode: 'date' }).defaultNow().notNull(),
    expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
  },
  table => ({
    orderIdx: index('warranty_order_idx').on(table.orderId),
    statusIdx: index('warranty_status_idx').on(table.status),
    expiresAtIdx: index('warranty_expires_at_idx').on(table.expiresAt),
  })
);

export const warrantyClaims = schema.table(
  'WarrantyClaims',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    warrantyId: uuid('warrantyId')
      .notNull()
      .references(() => warranties.id),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    description: text('description').notNull(),
    status: warrantyClaimStatusEnum('status').notNull().default('open'),
    resolution: text('resolution'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    resolvedAt: timestamp('resolvedAt', { mode: 'date' }),
  },
  table => ({
    warrantyIdx: index('claim_warranty_idx').on(table.warrantyId),
    userIdx: index('claim_user_idx').on(table.userId),
    statusIdx: index('claim_status_idx').on(table.status),
  })
);

export const warrantiesRelations = relations(warranties, ({ one, many }) => ({
  order: one(orders, {
    fields: [warranties.orderId],
    references: [orders.id],
  }),
  sparePart: one(spareParts, {
    fields: [warranties.sparePartId],
    references: [spareParts.id],
  }),
  claims: many(warrantyClaims),
}));

export const warrantyClaimsRelations = relations(
  warrantyClaims,
  ({ one }) => ({
    warranty: one(warranties, {
      fields: [warrantyClaims.warrantyId],
      references: [warranties.id],
    }),
    user: one(users, {
      fields: [warrantyClaims.userId],
      references: [users.id],
    }),
  })
);
