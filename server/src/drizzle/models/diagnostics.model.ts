import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { cars, employees, users } from '../schema';

export const dtcSeverityEnum = schema.enum('dtc_severity', [
  'info',
  'low',
  'medium',
  'high',
  'critical',
]);

export const reminderTypeEnum = schema.enum('reminder_type', [
  'oil_change',
  'tire_rotation',
  'brake_service',
  'scheduled_maintenance',
  'timing_belt',
  'other',
]);

export const diagnosticCodesCatalog = schema.table(
  'DiagnosticCodesCatalog',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 10 }).notNull().unique(),
    description: varchar('description', { length: 500 }).notNull(),
    descriptionRu: varchar('descriptionRu', { length: 500 }),
    severity: dtcSeverityEnum('severity').notNull().default('medium'),
    system: varchar('system', { length: 100 }),
    possibleCauses: text('possibleCauses'),
    possibleFixes: text('possibleFixes'),
  },
  table => ({
    codeIdx: index('dtc_code_idx').on(table.code),
  })
);

export const diagnosticSessions = schema.table(
  'DiagnosticSessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    carId: uuid('carId')
      .notNull()
      .references(() => cars.id),
    employeeId: uuid('employeeId').references(() => employees.id),
    orderId: uuid('orderId'),
    mileage: integer('mileage'),
    notes: text('notes'),
    rawData: text('rawData'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    carIdx: index('diag_session_car_idx').on(table.carId),
    createdAtIdx: index('diag_session_created_at_idx').on(table.createdAt),
  })
);

export const diagnosticResults = schema.table(
  'DiagnosticResults',
  {
    sessionId: uuid('sessionId')
      .notNull()
      .references(() => diagnosticSessions.id, { onDelete: 'cascade' }),
    codeId: uuid('codeId')
      .notNull()
      .references(() => diagnosticCodesCatalog.id),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    notes: text('notes'),
  },
  table => ({
    pk: primaryKey({ columns: [table.sessionId, table.codeId] }),
  })
);

export const maintenanceReminders = schema.table(
  'MaintenanceReminders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    carId: uuid('carId')
      .notNull()
      .references(() => cars.id),
    type: reminderTypeEnum('type').notNull(),
    description: varchar('description', { length: 500 }),
    dueDate: timestamp('dueDate', { mode: 'date' }),
    dueMileage: integer('dueMileage'),
    isSent: boolean('isSent').default(false).notNull(),
    isCompleted: boolean('isCompleted').default(false).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    userIdx: index('reminder_user_idx').on(table.userId),
    carIdx: index('reminder_car_idx').on(table.carId),
    dueDateIdx: index('reminder_due_date_idx').on(table.dueDate),
  })
);

export const diagnosticSessionsRelations = relations(
  diagnosticSessions,
  ({ one, many }) => ({
    car: one(cars, {
      fields: [diagnosticSessions.carId],
      references: [cars.id],
    }),
    employee: one(employees, {
      fields: [diagnosticSessions.employeeId],
      references: [employees.id],
    }),
    results: many(diagnosticResults),
  })
);

export const diagnosticResultsRelations = relations(
  diagnosticResults,
  ({ one }) => ({
    session: one(diagnosticSessions, {
      fields: [diagnosticResults.sessionId],
      references: [diagnosticSessions.id],
    }),
    code: one(diagnosticCodesCatalog, {
      fields: [diagnosticResults.codeId],
      references: [diagnosticCodesCatalog.id],
    }),
  })
);

export const diagnosticCodesCatalogRelations = relations(
  diagnosticCodesCatalog,
  ({ many }) => ({
    results: many(diagnosticResults),
  })
);

export const maintenanceRemindersRelations = relations(
  maintenanceReminders,
  ({ one }) => ({
    user: one(users, {
      fields: [maintenanceReminders.userId],
      references: [users.id],
    }),
    car: one(cars, {
      fields: [maintenanceReminders.carId],
      references: [cars.id],
    }),
  })
);
