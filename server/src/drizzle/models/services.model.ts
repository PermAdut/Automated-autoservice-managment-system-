import { relations } from 'drizzle-orm';
import { numeric, serial, varchar } from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { servicesOrders } from '../schema';

export const services = schema.table('Services', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: varchar('description'),
  price: numeric('price', { mode: 'number' }).notNull(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  servicesOrders: many(servicesOrders),
}));
