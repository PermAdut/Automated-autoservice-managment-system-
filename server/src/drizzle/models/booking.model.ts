import { relations } from 'drizzle-orm';
import { boolean, index, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { cars, employees, services, users } from '../schema';

export const appointmentStatusEnum = schema.enum('appointment_status', [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

export const timeSlots = schema.table(
  'TimeSlots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employeeId')
      .notNull()
      .references(() => employees.id),
    date: timestamp('date', { mode: 'date' }).notNull(),
    startTime: timestamp('startTime', { mode: 'date' }).notNull(),
    endTime: timestamp('endTime', { mode: 'date' }).notNull(),
    isBooked: boolean('isBooked').default(false).notNull(),
  },
  table => ({
    employeeDateIdx: index('timeslot_employee_date_idx').on(
      table.employeeId,
      table.date,
    ),
    dateIdx: index('timeslot_date_idx').on(table.date),
  })
);

export const appointments = schema.table(
  'Appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    carId: uuid('carId')
      .notNull()
      .references(() => cars.id),
    serviceId: uuid('serviceId').references(() => services.id),
    employeeId: uuid('employeeId').references(() => employees.id),
    timeSlotId: uuid('timeSlotId').references(() => timeSlots.id),
    status: appointmentStatusEnum('status').notNull().default('pending'),
    scheduledAt: timestamp('scheduledAt', { mode: 'date' }).notNull(),
    notes: text('notes'),
    confirmationCode: varchar('confirmationCode', { length: 20 }),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }),
  },
  table => ({
    userIdx: index('appointment_user_idx').on(table.userId),
    statusIdx: index('appointment_status_idx').on(table.status),
    scheduledAtIdx: index('appointment_scheduled_at_idx').on(table.scheduledAt),
  })
);

export const timeSlotsRelations = relations(timeSlots, ({ one, many }) => ({
  employee: one(employees, {
    fields: [timeSlots.employeeId],
    references: [employees.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [appointments.carId],
    references: [cars.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  employee: one(employees, {
    fields: [appointments.employeeId],
    references: [employees.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [appointments.timeSlotId],
    references: [timeSlots.id],
  }),
}));
