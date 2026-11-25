import { mysqlTable, varchar, timestamp, bigint, json } from 'drizzle-orm/mysql-core';
import { users } from './users.js';

export const auditLogs = mysqlTable('audit_logs', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 50 }),
  metadata: json('metadata'),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
