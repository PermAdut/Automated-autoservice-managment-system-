import { relations } from 'drizzle-orm';
import {
  bigint,
  index,
  numeric,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { cars, employees, services, spareParts, users } from '../schema';

export const paymentStatusEnum = schema.enum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
]);

export const orders = schema.table(
  'Orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    carId: uuid('carId')
      .notNull()
      .references(() => cars.id),
    employeeId: uuid('employeeId')
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
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('orderId')
    .notNull()
    .references(() => orders.id),
  amount: numeric('amount').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  paymentDate: timestamp('paymentDate', { mode: 'date' })
    .defaultNow()
    .notNull(),
  paymentMethod: varchar('paymentMethod', { length: 50 }).notNull(),
});

export const servicesOrders = schema.table(
  'Services_Orders',
  {
    servicesId: uuid('servicesId')
      .notNull()
      .references(() => services.id),
    orderId: uuid('orderId')
      .notNull()
      .references(() => orders.id),
    quantity: bigint('quantity', { mode: 'number' }).default(1).notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.servicesId, table.orderId] }),
  })
);

export const sparePartOrders = schema.table(
  'SparePart_Orders',
  {
    sparePartId: uuid('sparePartId')
      .notNull()
      .references(() => spareParts.id),
    ordersId: uuid('ordersId')
      .notNull()
      .references(() => orders.id),
    quantity: bigint('quantity', { mode: 'number' }).default(1),
  },
  table => ({
    pk: primaryKey({ columns: [table.sparePartId, table.ordersId] }),
  })
);

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
