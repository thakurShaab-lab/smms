import { mysqlTable, varchar, timestamp, int, bigint, date, mysqlEnum } from 'drizzle-orm/mysql-core';
import { classes, sections } from './classes.js';

export const students = mysqlTable('students', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  admissionNumber: varchar('admission_number', { length: 50 }).notNull().unique(),
  rollNumber: varchar('roll_number', { length: 20 }),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: mysqlEnum('gender', ['male', 'female', 'other']),
  classId: int('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'restrict' }),
  sectionId: bigint('section_id', { mode: 'number' })
    .notNull()
    .references(() => sections.id, { onDelete: 'restrict' }),
  status: mysqlEnum('status', ['active', 'graduated', 'transferred', 'inactive']).default('active').notNull(),
  profilePhotoKey: varchar('profile_photo_key', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});
