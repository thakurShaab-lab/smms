import { mysqlTable, varchar, int, timestamp, mysqlEnum, boolean, bigint } from 'drizzle-orm/mysql-core';
import { roles } from './rbac.js';

export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  email: varchar('email', { length: 190 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  roleId: int('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'restrict' }),
  status: mysqlEnum('status', ['active', 'suspended', 'invited']).default('active').notNull(),
  mustChangePassword: boolean('must_change_password').default(false).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});
