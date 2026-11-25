import * as classesService from './classes.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logAudit } from '../audit/audit.service.js';

export const createClass = asyncHandler(async (req, res) => {
  const classRecord = await classesService.createClass(req.body);
  await logAudit({ userId: req.user.id, action: 'class.create', entityType: 'class', entityId: classRecord.id, req });
  return sendSuccess(res, { statusCode: 201, message: 'Class created successfully', data: classRecord });
});

export const listClasses = asyncHandler(async (req, res) => {
  const rows = await classesService.listClasses();
  return sendSuccess(res, { message: 'Classes retrieved', data: rows });
});

export const getClass = asyncHandler(async (req, res) => {
  const classRecord = await classesService.getClassById(Number(req.params.id));
  return sendSuccess(res, { message: 'Class retrieved', data: classRecord });
});

export const updateClass = asyncHandler(async (req, res) => {
  const classRecord = await classesService.updateClass(Number(req.params.id), req.body);
  await logAudit({ userId: req.user.id, action: 'class.update', entityType: 'class', entityId: classRecord.id, req });
  return sendSuccess(res, { message: 'Class updated successfully', data: classRecord });
});

export const deleteClass = asyncHandler(async (req, res) => {
  await classesService.deleteClass(Number(req.params.id));
  await logAudit({ userId: req.user.id, action: 'class.delete', entityType: 'class', entityId: req.params.id, req });
  return sendSuccess(res, { message: 'Class deleted successfully' });
});

export const createSection = asyncHandler(async (req, res) => {
  const section = await classesService.createSection(req.body);
  await logAudit({ userId: req.user.id, action: 'section.create', entityType: 'section', entityId: section.id, req });
  return sendSuccess(res, { statusCode: 201, message: 'Section created successfully', data: section });
});

export const updateSection = asyncHandler(async (req, res) => {
  const section = await classesService.updateSection(Number(req.params.id), req.body);
  await logAudit({ userId: req.user.id, action: 'section.update', entityType: 'section', entityId: section.id, req });
  return sendSuccess(res, { message: 'Section updated successfully', data: section });
});

export const deleteSection = asyncHandler(async (req, res) => {
  await classesService.deleteSection(Number(req.params.id));
  await logAudit({ userId: req.user.id, action: 'section.delete', entityType: 'section', entityId: req.params.id, req });
  return sendSuccess(res, { message: 'Section deleted successfully' });
});
