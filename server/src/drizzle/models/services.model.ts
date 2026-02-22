import { relations } from 'drizzle-orm';
import { boolean, numeric, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { servicesOrders } from '../schema';

export const serviceCategories = schema.table('ServiceCategories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parentId'),
  isActive: boolean('isActive').default(true).notNull(),
});

export const services = schema.table('Services', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('categoryId').references(() => serviceCategories.id),
  name: varchar('name').notNull(),
  description: varchar('description'),
  price: numeric('price', { mode: 'number' }).notNull(),
  durationMinutes: numeric('durationMinutes'),
  isActive: boolean('isActive').default(true).notNull(),
});

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ one, many }) => ({
    parent: one(serviceCategories, {
      fields: [serviceCategories.parentId],
      references: [serviceCategories.id],
      relationName: 'parent',
    }),
    children: many(serviceCategories, { relationName: 'parent' }),
    services: many(services),
  })
);

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  servicesOrders: many(servicesOrders),
}));
