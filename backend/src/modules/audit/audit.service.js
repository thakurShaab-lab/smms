import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/index.js';
import { logger } from '../../utils/logger.js';

export async function logAudit({ userId = null, action, entityType, entityId = null, metadata = null, req = null }) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      entityType,
      entityId: entityId !== null ? String(entityId) : null,
      metadata,
      ipAddress: req?.ip || null
    });
  } catch (error) {
    logger.error('Failed to write audit log', { error: error.message, action, entityType });
  }
}
