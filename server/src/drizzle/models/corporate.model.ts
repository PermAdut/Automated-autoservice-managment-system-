import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  numeric,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { cars, users } from '../schema';

export const contractStatusEnum = schema.enum('contract_status', [
  'draft',
  'active',
  'suspended',
  'expired',
  'terminated',
]);

export const companies = schema.table(
  'Companies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    inn: varchar('inn', { length: 20 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    contactPerson: varchar('contactPerson', { length: 200 }),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 100 }),
    managerUserId: uuid('managerUserId').references(() => users.id),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    innIdx: index('company_inn_idx').on(table.inn),
    cityIdx: index('company_city_idx').on(table.city),
  })
);

export const companyContracts = schema.table(
  'CompanyContracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('companyId')
      .notNull()
      .references(() => companies.id),
    contractNumber: varchar('contractNumber', { length: 50 }),
    status: contractStatusEnum('status').notNull().default('draft'),
    discountPercent: numeric('discountPercent', { precision: 5, scale: 2 })
      .default('0')
      .notNull(),
    creditLimit: numeric('creditLimit', { precision: 12, scale: 2 }),
    paymentTermDays: numeric('paymentTermDays'),
    startDate: timestamp('startDate', { mode: 'date' }).notNull(),
    endDate: timestamp('endDate', { mode: 'date' }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    companyIdx: index('contract_company_idx').on(table.companyId),
    statusIdx: index('contract_status_idx').on(table.status),
    endDateIdx: index('contract_end_date_idx').on(table.endDate),
  })
);

export const companyCars = schema.table(
  'CompanyCars',
  {
    companyId: uuid('companyId')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    carId: uuid('carId')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assignedAt', { mode: 'date' }).defaultNow().notNull(),
    notes: varchar('notes', { length: 500 }),
  },
  table => ({
    pk: primaryKey({ columns: [table.companyId, table.carId] }),
  })
);

export const companiesRelations = relations(companies, ({ one, many }) => ({
  manager: one(users, {
    fields: [companies.managerUserId],
    references: [users.id],
  }),
  contracts: many(companyContracts),
  companyCars: many(companyCars),
}));

export const companyContractsRelations = relations(
  companyContracts,
  ({ one }) => ({
    company: one(companies, {
      fields: [companyContracts.companyId],
      references: [companies.id],
    }),
  })
);

export const companyCarsRelations = relations(companyCars, ({ one }) => ({
  company: one(companies, {
    fields: [companyCars.companyId],
    references: [companies.id],
  }),
  car: one(cars, {
    fields: [companyCars.carId],
    references: [cars.id],
  }),
}));
