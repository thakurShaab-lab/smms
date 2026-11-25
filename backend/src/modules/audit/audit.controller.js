import { desc, eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { auditLogs } from '../../db/schema/index.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { countRows } from '../../utils/dbCount.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const offset = (page - 1) * limit;

  const where = req.query.userId ? eq(auditLogs.userId, Number(req.query.userId)) : undefined;

  const rows = await db.query.auditLogs.findMany({
    where,
    orderBy: [desc(auditLogs.createdAt)],
    limit,
    offset
  });

  const totalItems = await countRows(auditLogs, where);

  return sendSuccess(res, {
    message: 'Audit logs retrieved',
    data: rows,
    meta: buildPaginationMeta({ page, limit, totalItems })
  });
});
