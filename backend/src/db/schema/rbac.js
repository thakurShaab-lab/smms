import { mysqlTable, varchar, int, timestamp, primaryKey } from 'drizzle-orm/mysql-core';

export const roles = mysqlTable('roles', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const permissions = mysqlTable('permissions', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rolePermissions = mysqlTable(
  'role_permissions',
  {
    roleId: int('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: int('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] })
  })
);
