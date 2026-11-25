import * as mediaService from './media.service.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import { logAudit } from '../audit/audit.service.js';
import { BadRequestError, ForbiddenError } from '../../utils/errors.js';
import { getStudentIdsForParentUser } from '../parents/parents.service.js';

function requireTeacherProfile(req) {
  if (!req.user.profileId) {
    throw new ForbiddenError('Only teachers can upload media');
  }
  return req.user.profileId;
}

function uploadHandlerFor(mediaType, serviceFn) {
  return asyncHandler(async (req, res) => {
    if (!req.file) throw new BadRequestError(`A ${mediaType} file is required`);
    const teacherId = requireTeacherProfile(req);

    const record = await serviceFn({
      teacherId,
      file: req.file,
      classId: req.body.classId,
      sectionId: req.body.sectionId,
      capturedAt: req.body.capturedAt
    });

    await logAudit({
      userId: req.user.id,
      action: `media.upload_${mediaType}`,
      entityType: 'media',
      entityId: record.id,
      req
    });

    return sendSuccess(res, { statusCode: 201, message: `${mediaType} uploaded and processed`, data: record });
  });
}

export const uploadPhoto = uploadHandlerFor('photo', mediaService.uploadPhoto);
export const uploadVideo = uploadHandlerFor('video', mediaService.uploadVideo);
export const uploadDocument = uploadHandlerFor('document', mediaService.uploadDocument);
export const uploadAudio = uploadHandlerFor('audio', mediaService.uploadAudio);

export const listMedia = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);

  let studentId = req.query.studentId ? Number(req.query.studentId) : undefined;

  if (req.user.role === 'parent') {
    const allowedStudentIds = await getStudentIdsForParentUser(req.user.id);
    if (studentId && !allowedStudentIds.includes(studentId)) {
      throw new ForbiddenError('You may only view media for your own children');
    }
    if (!studentId) {
      if (allowedStudentIds.length === 0) {
        return sendSuccess(res, { message: 'Media retrieved', data: [], meta: buildPaginationMeta({ page, limit, totalItems: 0 }) });
      }
      studentId = allowedStudentIds[0];
    }
  }

  const { rows, totalItems } = await mediaService.listMedia({
    page,
    limit,
    offset,
    studentId,
    classId: req.query.classId ? Number(req.query.classId) : undefined,
    sectionId: req.query.sectionId ? Number(req.query.sectionId) : undefined,
    mediaType: req.query.mediaType,
    status: req.query.status
  });

  return sendSuccess(res, {
    message: 'Media retrieved',
    data: rows,
    meta: buildPaginationMeta({ page, limit, totalItems })
  });
});

export const getMedia = asyncHandler(async (req, res) => {
  const record = await mediaService.getMediaById(Number(req.params.id));

  if (req.user.role === 'parent') {
    const allowedStudentIds = await getStudentIdsForParentUser(req.user.id);
    const isAllowed = record.mappings.some((mapping) => allowedStudentIds.includes(mapping.studentId));
    if (!isAllowed) throw new ForbiddenError('You may only view media for your own children');
  }

  return sendSuccess(res, { message: 'Media retrieved', data: record });
});

export const deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.deleteMedia(Number(req.params.id));
  await logAudit({ userId: req.user.id, action: 'media.delete', entityType: 'media', entityId: req.params.id, req });
  return sendSuccess(res, { message: 'Media deleted successfully' });
});

export const addManualMapping = asyncHandler(async (req, res) => {
  const record = await mediaService.addManualMapping(Number(req.params.id), req.body.studentId, req.user.id);
  await logAudit({
    userId: req.user.id,
    action: 'media.manual_map',
    entityType: 'media',
    entityId: req.params.id,
    metadata: { studentId: req.body.studentId },
    req
  });
  return sendSuccess(res, { message: 'Student tagged in media successfully', data: record });
});

export const removeMapping = asyncHandler(async (req, res) => {
  await mediaService.removeMapping(Number(req.params.id), Number(req.params.studentId));
  await logAudit({
    userId: req.user.id,
    action: 'media.remove_map',
    entityType: 'media',
    entityId: req.params.id,
    metadata: { studentId: req.params.studentId },
    req
  });
  return sendSuccess(res, { message: 'Student untagged from media successfully' });
});
