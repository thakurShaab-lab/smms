import { mysqlTable, varchar, timestamp, bigint, mysqlEnum, primaryKey } from 'drizzle-orm/mysql-core';
import { users } from './users.js';
import { students } from './students.js';

export const parents = mysqlTable('parents', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .unique()
    .references(() => users.id, { onDelete: 'set null' }),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 190 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const studentParents = mysqlTable(
  'student_parents',
  {
    studentId: bigint('student_id', { mode: 'number' })
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    parentId: bigint('parent_id', { mode: 'number' })
      .notNull()
      .references(() => parents.id, { onDelete: 'cascade' }),
    relationship: mysqlEnum('relationship', ['father', 'mother', 'guardian']).notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.studentId, table.parentId] })
  })
);
