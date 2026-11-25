import * as studentsService from './students.service.js';
import * as faceEnrollmentService from './faceEnrollment.service.js';
import * as speakerEnrollmentService from './speakerEnrollment.service.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import { logAudit } from '../audit/audit.service.js';
import { BadRequestError } from '../../utils/errors.js';

export const createStudent = asyncHandler(async (req, res) => {
  const student = await studentsService.createStudent(req.body);
  await logAudit({ userId: req.user.id, action: 'student.create', entityType: 'student', entityId: student.id, req });
  return sendSuccess(res, { statusCode: 201, message: 'Student created successfully', data: student });
});

export const listStudents = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalItems } = await studentsService.listStudents({
    page,
    limit,
    offset,
    search: req.query.search,
    classId: req.query.classId,
    sectionId: req.query.sectionId
  });
  return sendSuccess(res, {
    message: 'Students retrieved',
    data: rows,
    meta: buildPaginationMeta({ page, limit, totalItems })
  });
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await studentsService.getStudentById(Number(req.params.id));
  return sendSuccess(res, { message: 'Student retrieved', data: student });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentsService.updateStudent(Number(req.params.id), req.body);
  await logAudit({ userId: req.user.id, action: 'student.update', entityType: 'student', entityId: student.id, req });
  return sendSuccess(res, { message: 'Student updated successfully', data: student });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  await studentsService.deleteStudent(Number(req.params.id));
  await logAudit({ userId: req.user.id, action: 'student.deactivate', entityType: 'student', entityId: req.params.id, req });
  return sendSuccess(res, { message: 'Student deactivated successfully' });
});

export const addFaceImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('A face image file is required');
  const face = await faceEnrollmentService.addFaceImage(Number(req.params.id), req.file);
  await logAudit({
    userId: req.user.id,
    action: 'student.face_enroll',
    entityType: 'student',
    entityId: req.params.id,
    req
  });
  return sendSuccess(res, { statusCode: 201, message: 'Face enrolled successfully', data: face });
});

export const listFaceImages = asyncHandler(async (req, res) => {
  const faces = await faceEnrollmentService.listFaceImages(Number(req.params.id));
  return sendSuccess(res, { message: 'Face images retrieved', data: faces });
});

export const removeFaceImage = asyncHandler(async (req, res) => {
  await faceEnrollmentService.removeFaceImage(Number(req.params.id), Number(req.params.faceId));
  await logAudit({
    userId: req.user.id,
    action: 'student.face_remove',
    entityType: 'student',
    entityId: req.params.id,
    metadata: { faceId: req.params.faceId },
    req
  });
  return sendSuccess(res, { message: 'Face image removed successfully' });
});

export const rebuildFaceIndex = asyncHandler(async (req, res) => {
  const result = await faceEnrollmentService.rebuildFullFaceIndex();
  await logAudit({ userId: req.user.id, action: 'face_index.rebuild', entityType: 'face_index', req });
  return sendSuccess(res, { message: 'Face index rebuilt successfully', data: result });
});

export const addVoiceSample = asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('A voice audio file is required');
  const voice = await speakerEnrollmentService.addVoiceSample(Number(req.params.id), req.file);
  await logAudit({
    userId: req.user.id,
    action: 'student.voice_enroll',
    entityType: 'student',
    entityId: req.params.id,
    req
  });
  return sendSuccess(res, { statusCode: 201, message: 'Voice enrolled successfully', data: voice });
});

export const listVoiceSamples = asyncHandler(async (req, res) => {
  const voices = await speakerEnrollmentService.listVoiceSamples(Number(req.params.id));
  return sendSuccess(res, { message: 'Voice samples retrieved', data: voices });
});

export const removeVoiceSample = asyncHandler(async (req, res) => {
  await speakerEnrollmentService.removeVoiceSample(Number(req.params.id), Number(req.params.voiceId));
  await logAudit({
    userId: req.user.id,
    action: 'student.voice_remove',
    entityType: 'student',
    entityId: req.params.id,
    metadata: { voiceId: req.params.voiceId },
    req
  });
  return sendSuccess(res, { message: 'Voice sample removed successfully' });
});

export const rebuildSpeakerIndex = asyncHandler(async (req, res) => {
  const result = await speakerEnrollmentService.rebuildFullSpeakerIndex();
  await logAudit({ userId: req.user.id, action: 'speaker_index.rebuild', entityType: 'speaker_index', req });
  return sendSuccess(res, { message: 'Speaker index rebuilt successfully', data: result });
});
