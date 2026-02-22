import { relations } from 'drizzle-orm';
import { boolean, index, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { users } from '../schema';

export const notificationChannelEnum = schema.enum('notification_channel', [
  'email',
  'sms',
  'push',
]);

export const notificationStatusEnum = schema.enum('notification_status', [
  'pending',
  'sent',
  'failed',
  'delivered',
]);

export const notificationTemplates = schema.table('NotificationTemplates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  channel: notificationChannelEnum('channel').notNull(),
  subject: varchar('subject', { length: 200 }),
  body: text('body').notNull(),
  variables: text('variables'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const notifications = schema.table(
  'Notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    templateId: uuid('templateId').references(() => notificationTemplates.id),
    channel: notificationChannelEnum('channel').notNull(),
    status: notificationStatusEnum('status').notNull().default('pending'),
    subject: varchar('subject', { length: 200 }),
    body: text('body').notNull(),
    recipient: varchar('recipient', { length: 200 }).notNull(),
    sentAt: timestamp('sentAt', { mode: 'date' }),
    errorMessage: text('errorMessage'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    userIdx: index('notification_user_idx').on(table.userId),
    statusIdx: index('notification_status_idx').on(table.status),
    createdAtIdx: index('notification_created_at_idx').on(table.createdAt),
  })
);

export const notificationChannels = schema.table('NotificationChannels', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  channel: notificationChannelEnum('channel').notNull(),
  address: varchar('address', { length: 200 }).notNull(),
  isVerified: boolean('isVerified').default(false).notNull(),
  isEnabled: boolean('isEnabled').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  template: one(notificationTemplates, {
    fields: [notifications.templateId],
    references: [notificationTemplates.id],
  }),
}));

export const notificationTemplatesRelations = relations(
  notificationTemplates,
  ({ many }) => ({
    notifications: many(notifications),
  })
);

export const notificationChannelsRelations = relations(
  notificationChannels,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationChannels.userId],
      references: [users.id],
    }),
  })
);
