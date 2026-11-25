import { mysqlTable, varchar, timestamp, bigint } from 'drizzle-orm/mysql-core';
import { users } from './users.js';

export const teachers = mysqlTable('teachers', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  employeeCode: varchar('employee_code', { length: 50 }).notNull().unique(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});
