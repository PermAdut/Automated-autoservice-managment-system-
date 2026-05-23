import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { orders, reviews, subscriptions, users } from '../schema';
import { tenantSettings } from './tenant.model';

export const positions = schema.table('Position', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  description: varchar('description'),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
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
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const workSchedules = schema.table('WorkSchedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employeeId')
    .notNull()
    .references(() => employees.id),
  startTime: timestamp('startTime', { mode: 'date' }).notNull(),
  endTime: timestamp('endTime', { mode: 'date' }).notNull(),
  isAvailable: boolean('isAvailable').default(true).notNull(),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const workTypes = schema.table('WorkTypes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  tenantId: uuid('tenantId').references(() => tenantSettings.id),
});

export const employeeQualifications = schema.table(
  'EmployeeQualifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employeeId')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    workTypeId: uuid('workTypeId')
      .notNull()
      .references(() => workTypes.id, { onDelete: 'cascade' }),
    level: integer('level').notNull(),
    tenantId: uuid('tenantId').references(() => tenantSettings.id),
  },
  table => ({
    employeeWorkTypeUnique: uniqueIndex('employee_work_type_unique').on(
      table.employeeId,
      table.workTypeId,
    ),
  }),
);

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
  qualifications: many(employeeQualifications),
  orders: many(orders),
  subscriptions: many(subscriptions),
  reviews: many(reviews),
}));

export const workTypesRelations = relations(workTypes, ({ many }) => ({
  qualifications: many(employeeQualifications),
}));

export const employeeQualificationsRelations = relations(
  employeeQualifications,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeQualifications.employeeId],
      references: [employees.id],
    }),
    workType: one(workTypes, {
      fields: [employeeQualifications.workTypeId],
      references: [workTypes.id],
    }),
  }),
);

export const workSchedulesRelations = relations(workSchedules, ({ one }) => ({
  employee: one(employees, {
    fields: [workSchedules.employeeId],
    references: [employees.id],
  }),
}));
