import * as teachersService from './teachers.service.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import { logAudit } from '../audit/audit.service.js';

export const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await teachersService.createTeacher(req.body);
  await logAudit({ userId: req.user.id, action: 'teacher.create', entityType: 'teacher', entityId: teacher.id, req });
  return sendSuccess(res, { statusCode: 201, message: 'Teacher created successfully', data: teacher });
});

export const listTeachers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalItems } = await teachersService.listTeachers({ page, limit, offset, search: req.query.search });
  return sendSuccess(res, {
    message: 'Teachers retrieved',
    data: rows,
    meta: buildPaginationMeta({ page, limit, totalItems })
  });
});

export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await teachersService.getTeacherById(Number(req.params.id));
  return sendSuccess(res, { message: 'Teacher retrieved', data: teacher });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await teachersService.updateTeacher(Number(req.params.id), req.body);
  await logAudit({ userId: req.user.id, action: 'teacher.update', entityType: 'teacher', entityId: teacher.id, req });
  return sendSuccess(res, { message: 'Teacher updated successfully', data: teacher });
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const result = await teachersService.deleteTeacher(Number(req.params.id));
  await logAudit({ userId: req.user.id, action: 'teacher.deactivate', entityType: 'teacher', entityId: result.id, req });
  return sendSuccess(res, { message: 'Teacher deactivated successfully' });
});
