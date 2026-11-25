import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { env } from '../config/env.js';
import * as schema from './schema/index.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  dateStrings: false,
  namedPlaceholders: true
});

export const db = drizzle(pool, { schema, mode: 'default' });

export async function checkDbConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}
