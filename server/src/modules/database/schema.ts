import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  numeric,
  boolean,
  pgEnum,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const genderEnum = pgEnum('gender', ['M', 'F']);
export const oauthProviderEnum = pgEnum('oauth_provider', ['google', 'local']);

// Role table
export const roles = pgTable(
  'Role',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull().unique(),
  },
  table => ({
    nameIdx: index('role_name_idx').on(table.name),
  })
);

// Users table
export const users = pgTable(
  'Users',
  {
    id: serial('id').primaryKey(),
    roleId: bigint('roleId', { mode: 'number' })
      .notNull()
      .references(() => roles.id),
    login: varchar('login').notNull(),
    name: varchar('name').notNull(),
    surName: varchar('surName').notNull(),
    email: varchar('email', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    passwordHash: text('passwordHash'), // Nullable for OAuth users
    oauthProvider: oauthProviderEnum('oauthProvider').default('local'),
    oauthId: varchar('oauthId'), // Google ID or other OAuth provider ID
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

// Refresh tokens table
export const refreshTokens = pgTable(
  'RefreshTokens',
  {
    id: serial('id').primaryKey(),
    userId: bigint('userId', { mode: 'number' })
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

// Passport table
export const passports = pgTable('Passport', {
  id: serial('id').primaryKey(),
  userId: bigint('userId', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  identityNumber: varchar('identityNumber').notNull(),
  nationality: varchar('nationality').notNull(),
  birthDate: timestamp('birthDate', { mode: 'date' }).notNull(),
  gender: genderEnum('gender').notNull(),
  expirationDate: timestamp('expirationDate', { mode: 'date' }).notNull(),
});

// Position table
export const positions = pgTable('Position', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
});

// Employees table
export const employees = pgTable('Employees', {
  id: serial('id').primaryKey(),
  positionId: bigint('positionId', { mode: 'number' })
    .notNull()
    .references(() => positions.id),
  hireDate: timestamp('hireDate', { mode: 'date' }).defaultNow().notNull(),
  salary: numeric('salary').notNull(),
});

// WorkSchedule table
export const workSchedules = pgTable('WorkSchedule', {
  id: serial('id').primaryKey(),
  employeeId: bigint('employeeId', { mode: 'number' })
    .notNull()
    .references(() => employees.id),
  startTime: timestamp('startTime', { mode: 'date' }).notNull(),
  endTime: timestamp('endTime', { mode: 'date' }).notNull(),
  isAvailable: boolean('isAvailable').default(true).notNull(),
});

// Suppliers table
export const suppliers = pgTable('Suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contact: varchar('contact', { length: 100 }),
  address: text('address'),
});

// Store table
export const stores = pgTable('Store', {
  id: serial('id').primaryKey(),
  location: varchar('location', { length: 50 }).notNull(),
});

// Services table
export const services = pgTable('Services', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: varchar('description'),
  price: numeric('price').notNull(),
});

// Categories table
export const categories = pgTable('Categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
});

// SparePart table
export const spareParts = pgTable('SparePart', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  partNumber: varchar('partNumber').notNull(),
  price: numeric('price').notNull(),
  categoryId: bigint('categoryId', { mode: 'number' })
    .notNull()
    .references(() => categories.id),
});

// Cars table
export const cars = pgTable('Cars', {
  id: serial('id').primaryKey(),
  userId: bigint('userId', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  name: varchar('name').notNull(),
  information: text('information'),
  year: bigint('year', { mode: 'number' }).notNull(),
  vin: varchar('vin').notNull(),
  licensePlate: varchar('licensePlate'),
});

// Subscriptions table
export const subscriptions = pgTable('Subscriptions', {
  id: serial('id').primaryKey(),
  userId: bigint('userId', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  subscriptionDescription: text('subscriptionDescription'),
  subscriptionName: varchar('subscriptonName').notNull(),
  dateStart: timestamp('dateStart', { mode: 'date' }).defaultNow().notNull(),
  dateEnd: timestamp('dateEnd', { mode: 'date' }).notNull(),
});

// Orders table
export const orders = pgTable(
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

// Reviews table
export const reviews = pgTable('Reviews', {
  id: serial('id').primaryKey(),
  userId: bigint('userId', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  description: text('description'),
  rate: bigint('rate', { mode: 'number' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

// Payment table
export const payments = pgTable('Payment', {
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

// PositionsForBuying table
export const positionsForBuying = pgTable('PositionsForBuying', {
  id: serial('id').primaryKey(),
  supplierId: bigint('supplierId', { mode: 'number' })
    .notNull()
    .references(() => suppliers.id),
  quantity: bigint('quantity', { mode: 'number' }).notNull(),
  deliveryDate: timestamp('deliveryDate', { mode: 'date' })
    .defaultNow()
    .notNull(),
  status: varchar('status', { length: 20 }).notNull(),
});

// Invoices table
export const invoices = pgTable('Invoices', {
  id: serial('id').primaryKey(),
  positionForBuyingId: bigint('positionForBuyingId', { mode: 'number' })
    .notNull()
    .references(() => positionsForBuying.id),
  amount: numeric('amount').notNull(),
  invoiceDate: timestamp('invoiceDate', { mode: 'date' })
    .defaultNow()
    .notNull(),
  status: varchar('status', { length: 20 }).notNull(),
});

// Junction tables
export const servicesOrders = pgTable('Services_Orders', {
  servicesId: bigint('servicesId', { mode: 'number' })
    .notNull()
    .references(() => services.id),
  orderId: bigint('orderId', { mode: 'number' })
    .notNull()
    .references(() => orders.id),
  quantity: bigint('quantity', { mode: 'number' }).default(1).notNull(),
});

export const sparePartStore = pgTable('SparePart_Store', {
  sparePartId: bigint('sparePartId', { mode: 'number' })
    .notNull()
    .references(() => spareParts.id),
  storeId: bigint('storeId', { mode: 'number' })
    .notNull()
    .references(() => stores.id),
  quantity: bigint('quantity', { mode: 'number' }).default(1),
});

export const sparePartOrders = pgTable('SparePart_Orders', {
  sparePartId: bigint('sparePartId', { mode: 'number' })
    .notNull()
    .references(() => spareParts.id),
  ordersId: bigint('ordersId', { mode: 'number' })
    .notNull()
    .references(() => orders.id),
  quantity: bigint('quantity', { mode: 'number' }).default(1),
});

// Relations
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

export const positionsRelations = relations(positions, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  position: one(positions, {
    fields: [employees.positionId],
    references: [positions.id],
  }),
  workSchedules: many(workSchedules),
  orders: many(orders),
}));

export const workSchedulesRelations = relations(workSchedules, ({ one }) => ({
  employee: one(employees, {
    fields: [workSchedules.employeeId],
    references: [employees.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  positionsForBuying: many(positionsForBuying),
}));

export const positionsForBuyingRelations = relations(
  positionsForBuying,
  ({ one, many }) => ({
    supplier: one(suppliers, {
      fields: [positionsForBuying.supplierId],
      references: [suppliers.id],
    }),
    invoices: many(invoices),
  })
);

export const invoicesRelations = relations(invoices, ({ one }) => ({
  positionForBuying: one(positionsForBuying, {
    fields: [invoices.positionForBuyingId],
    references: [positionsForBuying.id],
  }),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  sparePartStore: many(sparePartStore),
}));

export const sparePartsRelations = relations(spareParts, ({ one, many }) => ({
  category: one(categories, {
    fields: [spareParts.categoryId],
    references: [categories.id],
  }),
  sparePartStore: many(sparePartStore),
  sparePartOrders: many(sparePartOrders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  spareParts: many(spareParts),
}));

export const sparePartStoreRelations = relations(sparePartStore, ({ one }) => ({
  sparePart: one(spareParts, {
    fields: [sparePartStore.sparePartId],
    references: [spareParts.id],
  }),
  store: one(stores, {
    fields: [sparePartStore.storeId],
    references: [stores.id],
  }),
}));

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
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

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

export const servicesRelations = relations(services, ({ many }) => ({
  servicesOrders: many(servicesOrders),
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
