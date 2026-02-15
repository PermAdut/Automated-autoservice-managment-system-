import { relations } from 'drizzle-orm';
import {
  index,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../pgSchema';
import { cars, orders, reviews, subscriptions } from '../schema';

export const genderEnum = schema.enum('gender', ['M', 'F']);
export const oauthProviderEnum = schema.enum('oauth_provider', [
  'google',
  'local',
]);

export const roles = schema.table(
  'Role',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name').notNull().unique(),
  },
  table => ({
    nameIdx: index('role_name_idx').on(table.name),
  })
);

export const users = schema.table(
  'Users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roleId: uuid('roleId')
      .notNull()
      .references(() => roles.id),
    login: varchar('login').notNull(),
    name: varchar('name').notNull(),
    surName: varchar('surName').notNull(),
    email: varchar('email', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    passwordHash: text('passwordHash'),
    oauthProvider: oauthProviderEnum('oauthProvider').default('local'),
    oauthId: varchar('oauthId'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }),
  },
  table => ({
    emailUnique: unique('email_unique').on(table.email),
    loginUnique: unique('login_unique').on(table.login),
    phoneUnique: unique('phone_unique').on(table.phone),
    emailIdx: index('user_email_idx').on(table.email),
    roleIdx: index('user_role_idx').on(table.roleId),
    oauthIdx: index('user_oauth_idx').on(table.oauthId),
  })
);

export const refreshTokens = schema.table(
  'RefreshTokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    tokenIdx: index('refresh_token_idx').on(table.token),
    userIdx: index('refresh_user_idx').on(table.userId),
  })
);

export const passports = schema.table('Passport', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  identityNumber: varchar('identityNumber').notNull(),
  birthDate: timestamp('birthDate', { mode: 'date' }).notNull(),
  gender: genderEnum('gender').notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  passport: one(passports, {
    fields: [users.id],
    references: [passports.userId],
  }),
  refreshTokens: many(refreshTokens),
  cars: many(cars),
  subscriptions: many(subscriptions),
  reviews: many(reviews),
  orders: many(orders),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const passportsRelations = relations(passports, ({ one }) => ({
  user: one(users, {
    fields: [passports.userId],
    references: [users.id],
  }),
}));
