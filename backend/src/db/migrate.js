import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, pool } from './client.js';
import { logger } from '../utils/logger.js';

async function run() {
  logger.info('Running database migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  logger.info('Migrations completed successfully.');
  await pool.end();
}

run().catch((error) => {
  logger.error('Migration failed', { error: error.message });
  process.exit(1);
});
