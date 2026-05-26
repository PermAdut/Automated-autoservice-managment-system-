import { relations } from 'drizzle-orm';
import { index, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { users } from '../schema';

export const syncLog = schema.table(
  'SyncLog',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    operation: varchar('operation').notNull(),
    entity: varchar('entity').notNull(),
    entityId: uuid('entityId').notNull(),
    status: varchar('status').notNull(),
    error: text('error'),
    syncedAt: timestamp('syncedAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    userIdx: index('sync_log_user_idx').on(table.userId),
    syncedAtIdx: index('sync_log_synced_at_idx').on(table.syncedAt),
  })
);

export const syncLogRelations = relations(syncLog, ({ one }) => ({
  user: one(users, {
    fields: [syncLog.userId],
    references: [users.id],
  }),
}));
