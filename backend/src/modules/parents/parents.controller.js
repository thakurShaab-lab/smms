import * as parentsService from './parents.service.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import { logAudit } from '../audit/audit.service.js';

export const createParent = asyncHandler(async (req, res) => {
  const parent = await parentsService.createParent(req.body);
  await logAudit({ userId: req.user.id, action: 'parent.create', entityType: 'parent', entityId: parent.id, req });
  return sendSuccess(res, { statusCode: 201, message: 'Parent created successfully', data: parent });
});

export const listParents = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalItems } = await parentsService.listParents({ page, limit, offset, search: req.query.search });
  return sendSuccess(res, {
    message: 'Parents retrieved',
    data: rows,
    meta: buildPaginationMeta({ page, limit, totalItems })
  });
});

export const getParent = asyncHandler(async (req, res) => {
  const parent = await parentsService.getParentById(Number(req.params.id));
  return sendSuccess(res, { message: 'Parent retrieved', data: parent });
});

export const updateParent = asyncHandler(async (req, res) => {
  const parent = await parentsService.updateParent(Number(req.params.id), req.body);
  await logAudit({ userId: req.user.id, action: 'parent.update', entityType: 'parent', entityId: parent.id, req });
  return sendSuccess(res, { message: 'Parent updated successfully', data: parent });
});

export const linkStudent = asyncHandler(async (req, res) => {
  const parent = await parentsService.linkStudentToParent(
    Number(req.params.id),
    req.body.studentId,
    req.body.relationship
  );
  await logAudit({
    userId: req.user.id,
    action: 'parent.link_student',
    entityType: 'parent',
    entityId: parent.id,
    metadata: { studentId: req.body.studentId },
    req
  });
  return sendSuccess(res, { message: 'Student linked to parent successfully', data: parent });
});

export const unlinkStudent = asyncHandler(async (req, res) => {
  await parentsService.unlinkStudentFromParent(Number(req.params.id), Number(req.params.studentId));
  await logAudit({
    userId: req.user.id,
    action: 'parent.unlink_student',
    entityType: 'parent',
    entityId: req.params.id,
    metadata: { studentId: req.params.studentId },
    req
  });
  return sendSuccess(res, { message: 'Student unlinked from parent successfully' });
});
