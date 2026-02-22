import { boolean, integer, jsonb, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';

/**
 * Tenant (White-label / Embedded) settings.
 * A single row stores the configuration of this AutoService installation.
 * For multi-tenant SaaS, a tenantId FK would be added to all core tables.
 */
export const tenantSettings = schema.table('TenantSettings', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Branding
  companyName: varchar('companyName', { length: 200 }).notNull().default('AutoService'),
  tagline: varchar('tagline', { length: 300 }),
  description: text('description'),
  logoUrl: varchar('logoUrl', { length: 500 }),
  faviconUrl: varchar('faviconUrl', { length: 500 }),
  primaryColor: varchar('primaryColor', { length: 20 }).default('#4f46e5'),
  secondaryColor: varchar('secondaryColor', { length: 20 }).default('#0ea5e9'),
  accentColor: varchar('accentColor', { length: 20 }).default('#10b981'),
  fontFamily: varchar('fontFamily', { length: 100 }).default('Inter'),

  // Contact
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }).default('RU'),
  postalCode: varchar('postalCode', { length: 20 }),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 200 }),
  mapCoordinates: varchar('mapCoordinates', { length: 100 }),

  // Operational
  workingHours: varchar('workingHours', { length: 200 }).default('Пн-Сб: 9:00-19:00'),
  currency: varchar('currency', { length: 10 }).default('RUB'),
  timezone: varchar('timezone', { length: 50 }).default('Europe/Moscow'),
  language: varchar('language', { length: 10 }).default('ru'),

  // Feature toggles
  featureOnlineBooking: boolean('featureOnlineBooking').default(true).notNull(),
  featureVinDecoder: boolean('featureVinDecoder').default(true).notNull(),
  featureLoyaltyProgram: boolean('featureLoyaltyProgram').default(true).notNull(),
  featurePartnerNetwork: boolean('featurePartnerNetwork').default(false).notNull(),
  featureMultiBranch: boolean('featureMultiBranch').default(false).notNull(),
  featureCorporateClients: boolean('featureCorporateClients').default(false).notNull(),
  featureSmsNotifications: boolean('featureSmsNotifications').default(false).notNull(),
  featureEmailNotifications: boolean('featureEmailNotifications').default(false).notNull(),

  // Business limits
  maxEmployees: integer('maxEmployees').default(50),
  maxStorageItems: integer('maxStorageItems').default(1000),

  // Integrations (JSON config)
  integrationConfig: jsonb('integrationConfig'),

  // Setup
  isSetupComplete: boolean('isSetupComplete').default(false).notNull(),
  setupCompletedAt: timestamp('setupCompletedAt', { mode: 'date' }),

  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * Custom pages / content blocks for the embedded installation.
 * Allows admins to customize About page, Privacy policy, etc.
 */
export const tenantPages = schema.table('TenantPages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  isPublished: boolean('isPublished').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});
