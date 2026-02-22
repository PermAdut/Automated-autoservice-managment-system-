import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { spareParts, users } from '../schema';

export const partnerStatusEnum = schema.enum('partner_status', [
  'active',
  'pending',
  'suspended',
  'inactive',
]);

export const partRequestStatusEnum = schema.enum('part_request_status', [
  'pending',
  'approved',
  'rejected',
  'transferred',
  'cancelled',
]);

export const partners = schema.table(
  'Partners',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 100 }),
    website: varchar('website', { length: 200 }),
    apiUrl: varchar('apiUrl', { length: 300 }),
    status: partnerStatusEnum('status').notNull().default('pending'),
    description: text('description'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    statusIdx: index('partner_status_idx').on(table.status),
    cityIdx: index('partner_city_idx').on(table.city),
  })
);

export const partnerApiKeys = schema.table(
  'PartnerApiKeys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    partnerId: uuid('partnerId')
      .notNull()
      .references(() => partners.id, { onDelete: 'cascade' }),
    keyHash: text('keyHash').notNull().unique(),
    name: varchar('name', { length: 100 }),
    scopes: text('scopes'),
    expiresAt: timestamp('expiresAt', { mode: 'date' }),
    lastUsedAt: timestamp('lastUsedAt', { mode: 'date' }),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    keyHashIdx: index('partner_api_key_idx').on(table.keyHash),
    partnerIdx: index('partner_api_partner_idx').on(table.partnerId),
  })
);

export const partnerSparePartRequests = schema.table(
  'PartnerSparePartRequests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fromPartnerId: uuid('fromPartnerId')
      .notNull()
      .references(() => partners.id),
    toPartnerId: uuid('toPartnerId')
      .notNull()
      .references(() => partners.id),
    sparePartId: uuid('sparePartId')
      .notNull()
      .references(() => spareParts.id),
    quantity: integer('quantity').notNull().default(1),
    status: partRequestStatusEnum('status').notNull().default('pending'),
    notes: text('notes'),
    requestedAt: timestamp('requestedAt', { mode: 'date' }).defaultNow().notNull(),
    resolvedAt: timestamp('resolvedAt', { mode: 'date' }),
  },
  table => ({
    fromPartnerIdx: index('part_req_from_idx').on(table.fromPartnerId),
    statusIdx: index('part_req_status_idx').on(table.status),
  })
);

export const partnerClientRedirects = schema.table(
  'PartnerClientRedirects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    fromPartnerId: uuid('fromPartnerId')
      .notNull()
      .references(() => partners.id),
    toPartnerId: uuid('toPartnerId')
      .notNull()
      .references(() => partners.id),
    reason: varchar('reason', { length: 500 }),
    serviceRequested: varchar('serviceRequested', { length: 200 }),
    accepted: boolean('accepted'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    userIdx: index('redirect_user_idx').on(table.userId),
  })
);

export const partnersRelations = relations(partners, ({ many }) => ({
  apiKeys: many(partnerApiKeys),
  outgoingRequests: many(partnerSparePartRequests, {
    relationName: 'fromPartner',
  }),
  incomingRequests: many(partnerSparePartRequests, {
    relationName: 'toPartner',
  }),
}));

export const partnerApiKeysRelations = relations(
  partnerApiKeys,
  ({ one }) => ({
    partner: one(partners, {
      fields: [partnerApiKeys.partnerId],
      references: [partners.id],
    }),
  })
);

export const partnerSparePartRequestsRelations = relations(
  partnerSparePartRequests,
  ({ one }) => ({
    fromPartner: one(partners, {
      fields: [partnerSparePartRequests.fromPartnerId],
      references: [partners.id],
      relationName: 'fromPartner',
    }),
    toPartner: one(partners, {
      fields: [partnerSparePartRequests.toPartnerId],
      references: [partners.id],
      relationName: 'toPartner',
    }),
    sparePart: one(spareParts, {
      fields: [partnerSparePartRequests.sparePartId],
      references: [spareParts.id],
    }),
  })
);

export const partnerClientRedirectsRelations = relations(
  partnerClientRedirects,
  ({ one }) => ({
    user: one(users, {
      fields: [partnerClientRedirects.userId],
      references: [users.id],
    }),
    fromPartner: one(partners, {
      fields: [partnerClientRedirects.fromPartnerId],
      references: [partners.id],
    }),
    toPartner: one(partners, {
      fields: [partnerClientRedirects.toPartnerId],
      references: [partners.id],
    }),
  })
);
