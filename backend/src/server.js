import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { checkDbConnection, pool } from './db/client.js';
import { initSocket } from './sockets/socket.manager.js';
import { ensureUploadRoot, UPLOAD_ROOT } from './services/storage.service.js';

async function start() {
  await checkDbConnection();
  logger.info('Database connection established');

  await ensureUploadRoot();
  logger.info(`Local upload storage ready at ${UPLOAD_ROOT}`);

  const app = createApp();
  const httpServer = http.createServer(app);

  initSocket(httpServer);
  logger.info('Socket.IO initialized');

  httpServer.listen(env.port, () => {
    logger.info(`SMMS backend listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    httpServer.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  logger.error('Failed to start server', { error: error.message, stack: error.stack });
  process.exit(1);
});
