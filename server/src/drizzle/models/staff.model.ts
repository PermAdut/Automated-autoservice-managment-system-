import { relations } from 'drizzle-orm';
import {
  boolean,
  numeric,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { orders, reviews, subscriptions, users } from '../schema';

export const positions = schema.table('Position', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  description: varchar('description'),
});

export const employees = schema.table('Employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  surName: varchar('surName', { length: 100 }).notNull(),
  lastName: varchar('lastName', { length: 100 }),
  positionId: uuid('positionId')
    .notNull()
    .references(() => positions.id),
  hireDate: timestamp('hireDate', { mode: 'date' }).defaultNow().notNull(),
  salary: numeric('salary').notNull(),
});

export const workSchedules = schema.table('WorkSchedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employeeId')
    .notNull()
    .references(() => employees.id),
  startTime: timestamp('startTime', { mode: 'date' }).notNull(),
  endTime: timestamp('endTime', { mode: 'date' }).notNull(),
  isAvailable: boolean('isAvailable').default(true).notNull(),
});

export const positionsRelations = relations(positions, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  position: one(positions, {
    fields: [employees.positionId],
    references: [positions.id],
  }),
  workSchedules: many(workSchedules),
  orders: many(orders),
  subscriptions: many(subscriptions),
  reviews: many(reviews),
}));

export const workSchedulesRelations = relations(workSchedules, ({ one }) => ({
  employee: one(employees, {
    fields: [workSchedules.employeeId],
    references: [employees.id],
  }),
}));
