import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  numeric,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { cars, employees, services, spareParts, users } from '../schema';

export const orders = schema.table(
  'Orders',
  {
    id: serial('id').primaryKey(),
    userId: bigint('userId', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    carId: bigint('carId', { mode: 'number' })
      .notNull()
      .references(() => cars.id),
    employeeId: bigint('employeeId', { mode: 'number' })
      .notNull()
      .references(() => employees.id),
    status: varchar('status', { length: 20 }),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }),
    completedAt: timestamp('completedAt', { mode: 'date' }),
  },
  table => ({
    userIdx: index('order_user_idx').on(table.userId),
    statusIdx: index('order_status_idx').on(table.status),
    createdAtIdx: index('order_created_at_idx').on(table.createdAt),
  })
);

export const payments = schema.table('Payment', {
  id: serial('id').primaryKey(),
  orderId: bigint('orderId', { mode: 'number' })
    .notNull()
    .references(() => orders.id),
  amount: numeric('amount').notNull(),
  status: boolean('status').notNull(),
  paymentDate: timestamp('paymentDate', { mode: 'date' })
    .defaultNow()
    .notNull(),
  paymentMethod: varchar('paymentMethod', { length: 50 }).notNull(),
});

export const servicesOrders = schema.table('Services_Orders', {
  servicesId: bigint('servicesId', { mode: 'number' })
    .notNull()
    .references(() => services.id),
  orderId: bigint('orderId', { mode: 'number' })
    .notNull()
    .references(() => orders.id),
  quantity: bigint('quantity', { mode: 'number' }).default(1).notNull(),
});

export const sparePartOrders = schema.table('SparePart_Orders', {
  sparePartId: bigint('sparePartId', { mode: 'number' })
    .notNull()
    .references(() => spareParts.id),
  ordersId: bigint('ordersId', { mode: 'number' })
    .notNull()
    .references(() => orders.id),
  quantity: bigint('quantity', { mode: 'number' }).default(1),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [orders.carId],
    references: [cars.id],
  }),
  employee: one(employees, {
    fields: [orders.employeeId],
    references: [employees.id],
  }),
  payments: many(payments),
  servicesOrders: many(servicesOrders),
  sparePartOrders: many(sparePartOrders),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const servicesOrdersRelations = relations(servicesOrders, ({ one }) => ({
  service: one(services, {
    fields: [servicesOrders.servicesId],
    references: [services.id],
  }),
  order: one(orders, {
    fields: [servicesOrders.orderId],
    references: [orders.id],
  }),
}));

export const sparePartOrdersRelations = relations(
  sparePartOrders,
  ({ one }) => ({
    sparePart: one(spareParts, {
      fields: [sparePartOrders.sparePartId],
      references: [spareParts.id],
    }),
    order: one(orders, {
      fields: [sparePartOrders.ordersId],
      references: [orders.id],
    }),
  })
);
