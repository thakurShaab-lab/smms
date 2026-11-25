import { mysqlTable, varchar, timestamp, boolean, bigint } from 'drizzle-orm/mysql-core';
import { users } from './users.js';

export const sessions = mysqlTable('sessions', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: varchar('user_agent', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const refreshTokens = mysqlTable('refresh_tokens', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sessionId: bigint('session_id', { mode: 'number' })
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  replacedByTokenHash: varchar('replaced_by_token_hash', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
