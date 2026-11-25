import { mysqlTable, varchar, timestamp, int, bigint, unique } from 'drizzle-orm/mysql-core';

export const classes = mysqlTable('classes', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  displayOrder: int('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const sections = mysqlTable(
  'sections',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    classId: int('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => ({
    classSectionUnique: unique('class_section_unique').on(table.classId, table.name)
  })
);
