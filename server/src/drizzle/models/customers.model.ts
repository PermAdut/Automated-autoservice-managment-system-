import { relations } from 'drizzle-orm';
import { bigint, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { employees, orders, users } from '../schema';

export const cars = schema.table('Cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  brand: varchar('brand').notNull(),
  model: varchar('model').notNull(),
  information: text('information'),
  year: bigint('year', { mode: 'number' }).notNull(),
  vin: varchar('vin').notNull(),
  licensePlate: varchar('licensePlate'),
});

export const subscriptions = schema.table('Subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  employeeId: uuid('employeeId')
    .references(() => employees.id),
  subscriptionDescription: text('subscriptionDescription'),
  subscriptionName: varchar('subscriptionName').notNull(),
  dateStart: timestamp('dateStart', { mode: 'date' }).defaultNow().notNull(),
  dateEnd: timestamp('dateEnd', { mode: 'date' }).notNull(),
});

export const reviews = schema.table('Reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  employeeId: uuid('employeeId')
    .references(() => employees.id),
  description: text('description'),
  rate: bigint('rate', { mode: 'number' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

export const carsRelations = relations(cars, ({ one, many }) => ({
  user: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  employee: one(employees, {
    fields: [subscriptions.employeeId],
    references: [employees.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  employee: one(employees, {
    fields: [reviews.employeeId],
    references: [employees.id],
  }),
}));
