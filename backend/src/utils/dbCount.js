import { count } from 'drizzle-orm';
import { db } from '../db/client.js';

export async function countRows(table, whereClause) {
  const query = db.select({ value: count() }).from(table);
  const rows = whereClause ? await query.where(whereClause) : await query;
  return Number(rows[0]?.value ?? 0);
}
