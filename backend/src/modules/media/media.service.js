import { eq, and, inArray, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { media, mediaFiles, mediaMetadata, mediaMapping, ocrResults, students } from '../../db/schema/index.js';
import {
  buildStorageKey,
  uploadBuffer,
  getSignedDownloadUrl
} from '../../services/storage.service.js';
import * as pythonAiClient from '../../services/pythonAiClient.js';
import {
  resolveFacesToStudentMatches,
  resolveSpeakerSegmentsToStudentMatches,
  persistMediaMappings
} from './mediaMatching.service.js';
import { base64ToBuffer } from '../../utils/base64.js';
import { NotFoundError } from '../../utils/errors.js';
import { countRows } from '../../utils/dbCount.js';
import { MEDIA_TYPES, MEDIA_STATUS, FILE_ROLES } from '../../config/constants.js';
import { emitMediaProcessed, emitMediaFailed } from '../../sockets/socket.manager.js';
import { logger } from '../../utils/logger.js';

async function createMediaRecord({ teacherId, mediaType, file, classId, sectionId, capturedAt }) {
  const storageKey = buildStorageKey({ prefix: `media/${mediaType}`, originalFilename: file.originalname });
  await uploadBuffer({ key: storageKey, buffer: file.buffer, contentType: file.mimetype });

  const [result] = await db.insert(media).values({
    uploadedByTeacherId: teacherId,
    mediaType,
    status: MEDIA_STATUS.PROCESSING,
    originalStorageKey: storageKey,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    classId: classId || null,
    sectionId: sectionId || null,
    capturedAt: capturedAt ? new Date(capturedAt) : null
  });

  await db.insert(mediaFiles).values({
    mediaId: result.insertId,
    fileRole: FILE_ROLES.ORIGINAL,
    storageKey,
    mimeType: file.mimetype,
    sizeBytes: file.size
  });

  return { mediaId: result.insertId, storageKey };
}

async function markFailed(mediaId, mediaType, error) {
  logger.error('Media processing failed', { mediaId, mediaType, error: error.message });
  await db
    .update(media)
    .set({ status: MEDIA_STATUS.FAILED, processingError: error.message.slice(0, 500) })
    .where(eq(media.id, mediaId));
  emitMediaFailed({ mediaId, mediaType, error: error.message });
}

export async function uploadPhoto({ teacherId, file, classId, sectionId, capturedAt }) {
  const { mediaId, storageKey } = await createMediaRecord({
    teacherId,
    mediaType: MEDIA_TYPES.PHOTO,
    file,
    classId,
    sectionId,
    capturedAt
  });

  try {
    const signedUrl = await getSignedDownloadUrl(storageKey);
    const result = await pythonAiClient.recognizePhoto({ imageUrl: signedUrl });

    const studentMatches = await resolveFacesToStudentMatches(result.faces || []);
    const matchedStudentIds = await persistMediaMappings(mediaId, studentMatches, 'ai');

    await db.insert(mediaMetadata).values({
      mediaId,
      width: result.width ?? null,
      height: result.height ?? null,
      extra: { faceCount: (result.faces || []).length }
    });

    await db.update(media).set({ status: MEDIA_STATUS.COMPLETED }).where(eq(media.id, mediaId));
    emitMediaProcessed({ mediaId, mediaType: MEDIA_TYPES.PHOTO, studentIds: matchedStudentIds, classId });

    return getMediaById(mediaId);
  } catch (error) {
    await markFailed(mediaId, MEDIA_TYPES.PHOTO, error);
    throw error;
  }
}

export async function uploadVideo({ teacherId, file, classId, sectionId, capturedAt }) {
  const { mediaId, storageKey } = await createMediaRecord({
    teacherId,
    mediaType: MEDIA_TYPES.VIDEO,
    file,
    classId,
    sectionId,
    capturedAt
  });

  try {
    const signedUrl = await getSignedDownloadUrl(storageKey);
    const result = await pythonAiClient.recognizeVideo({ videoUrl: signedUrl });

    if (result.thumbnail_base64) {
      const thumbKey = buildStorageKey({ prefix: `media/video-thumbnails`, originalFilename: 'thumb.jpg' });
      await uploadBuffer({
        key: thumbKey,
        buffer: base64ToBuffer(result.thumbnail_base64),
        contentType: result.thumbnail_mime || 'image/jpeg'
      });
      await db.insert(mediaFiles).values({
        mediaId,
        fileRole: FILE_ROLES.THUMBNAIL,
        storageKey: thumbKey,
        mimeType: result.thumbnail_mime || 'image/jpeg'
      });
    }

    if (result.preview_base64) {
      const previewKey = buildStorageKey({ prefix: `media/video-previews`, originalFilename: 'preview.mp4' });
      await uploadBuffer({
        key: previewKey,
        buffer: base64ToBuffer(result.preview_base64),
        contentType: result.preview_mime || 'video/mp4'
      });
      await db.insert(mediaFiles).values({
        mediaId,
        fileRole: FILE_ROLES.PREVIEW,
        storageKey: previewKey,
        mimeType: result.preview_mime || 'video/mp4'
      });
    }

    await db.insert(mediaMetadata).values({
      mediaId,
      width: result.width ?? null,
      height: result.height ?? null,
      durationSeconds: result.duration_seconds ?? null,
      fps: result.fps ?? null,
      frameCount: result.frame_count ?? null,
      extra: { sampledFrames: (result.frames || []).length }
    });

    const allFaces = (result.frames || []).flatMap((frame) =>
      (frame.faces || []).map((face) => ({ ...face, timestamp: frame.timestamp }))
    );
    const studentMatches = await resolveFacesToStudentMatches(allFaces);
    const matchedStudentIds = await persistMediaMappings(mediaId, studentMatches, 'ai');

    await db.update(media).set({ status: MEDIA_STATUS.COMPLETED }).where(eq(media.id, mediaId));
    emitMediaProcessed({ mediaId, mediaType: MEDIA_TYPES.VIDEO, studentIds: matchedStudentIds, classId });

    return getMediaById(mediaId);
  } catch (error) {
    await markFailed(mediaId, MEDIA_TYPES.VIDEO, error);
    throw error;
  }
}

export async function uploadDocument({ teacherId, file, classId, sectionId, capturedAt }) {
  const { mediaId, storageKey } = await createMediaRecord({
    teacherId,
    mediaType: MEDIA_TYPES.DOCUMENT,
    file,
    classId,
    sectionId,
    capturedAt
  });

  try {
    const signedUrl = await getSignedDownloadUrl(storageKey);
    const result = await pythonAiClient.processDocument({ documentUrl: signedUrl, mimeType: file.mimetype });

    if (result.page_image_base64) {
      const pageKey = buildStorageKey({ prefix: `media/document-pages`, originalFilename: 'page.jpg' });
      await uploadBuffer({
        key: pageKey,
        buffer: base64ToBuffer(result.page_image_base64),
        contentType: result.page_image_mime || 'image/jpeg'
      });
      await db.insert(mediaFiles).values({
        mediaId,
        fileRole: FILE_ROLES.OCR_PAGE,
        storageKey: pageKey,
        mimeType: result.page_image_mime || 'image/jpeg'
      });
    }

    const extracted = result.extracted || {};
    let matchedStudentId = null;
    if (extracted.admission_number) {
      const matchedStudent = await db.query.students.findFirst({
        where: eq(students.admissionNumber, extracted.admission_number)
      });
      matchedStudentId = matchedStudent?.id ?? null;
    }

    await db.insert(ocrResults).values({
      mediaId,
      rawText: result.raw_text ?? null,
      extractedStudentName: extracted.student_name ?? null,
      extractedAdmissionNumber: extracted.admission_number ?? null,
      extractedRollNumber: extracted.roll_number ?? null,
      extractedClassName: extracted.class_name ?? null,
      extractedSectionName: extracted.section_name ?? null,
      matchedStudentId,
      confidence: result.confidence ?? null
    });

    const studentMatches = await resolveFacesToStudentMatches(result.faces || []);
    if (matchedStudentId && !studentMatches.some((m) => m.studentId === matchedStudentId)) {
      studentMatches.push({ studentId: matchedStudentId, matchConfidence: result.confidence ?? 1, faceBbox: null });
    }
    const matchedStudentIds = await persistMediaMappings(mediaId, studentMatches, 'ai');

    await db.update(media).set({ status: MEDIA_STATUS.COMPLETED }).where(eq(media.id, mediaId));
    emitMediaProcessed({ mediaId, mediaType: MEDIA_TYPES.DOCUMENT, studentIds: matchedStudentIds, classId });

    return getMediaById(mediaId);
  } catch (error) {
    await markFailed(mediaId, MEDIA_TYPES.DOCUMENT, error);
    throw error;
  }
}

export async function uploadAudio({ teacherId, file, classId, sectionId, capturedAt }) {
  const { mediaId, storageKey } = await createMediaRecord({
    teacherId,
    mediaType: MEDIA_TYPES.AUDIO,
    file,
    classId,
    sectionId,
    capturedAt
  });

  try {
    const signedUrl = await getSignedDownloadUrl(storageKey);
    const result = await pythonAiClient.recognizeAudio({ audioUrl: signedUrl });

    await db.insert(mediaMetadata).values({
      mediaId,
      durationSeconds: result.duration_seconds ?? null,
      codec: result.codec ?? null,
      extra: {
        bitrate: result.bitrate ?? null,
        sampleRate: result.sample_rate ?? null,
        segmentsScanned: (result.segments || []).length
      }
    });

    const studentMatches = await resolveSpeakerSegmentsToStudentMatches(result.segments || []);
    const matchedStudentIds = await persistMediaMappings(mediaId, studentMatches, 'ai');

    await db.update(media).set({ status: MEDIA_STATUS.COMPLETED }).where(eq(media.id, mediaId));
    emitMediaProcessed({ mediaId, mediaType: MEDIA_TYPES.AUDIO, studentIds: matchedStudentIds, classId });

    return getMediaById(mediaId);
  } catch (error) {
    await markFailed(mediaId, MEDIA_TYPES.AUDIO, error);
    throw error;
  }
}

export async function getMediaById(id) {
  const record = await db.query.media.findFirst({
    where: eq(media.id, id),
    with: {
      files: true,
      metadata: true,
      ocrResult: true,
      mappings: { with: { student: true } },
      teacher: { columns: { id: true, fullName: true, employeeCode: true } }
    }
  });
  if (!record) throw new NotFoundError('Media not found');
  return attachSignedUrls(record);
}

async function attachSignedUrls(record) {
  const files = await Promise.all(
    (record.files || []).map(async (file) => ({
      ...file,
      url: await getSignedDownloadUrl(file.storageKey)
    }))
  );
  return { ...record, files };
}

export async function listMedia({ page, limit, offset, studentId, classId, sectionId, mediaType, status }) {
  const conditions = [];
  if (classId) conditions.push(eq(media.classId, classId));
  if (sectionId) conditions.push(eq(media.sectionId, sectionId));
  if (mediaType) conditions.push(eq(media.mediaType, mediaType));
  if (status) conditions.push(eq(media.status, status));

  let mediaIdsForStudent = null;
  if (studentId) {
    const mappings = await db.query.mediaMapping.findMany({ where: eq(mediaMapping.studentId, studentId) });
    mediaIdsForStudent = mappings.map((m) => m.mediaId);
    if (mediaIdsForStudent.length === 0) return { rows: [], totalItems: 0 };
    conditions.push(inArray(media.id, mediaIdsForStudent));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.query.media.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: [desc(media.createdAt)],
    with: {
      files: true,
      mappings: { with: { student: { columns: { id: true, fullName: true, admissionNumber: true } } } }
    }
  });

  const withUrls = await Promise.all(rows.map((row) => attachSignedUrls(row)));
  const totalItems = await countRows(media, whereClause);

  return { rows: withUrls, totalItems };
}

export async function deleteMedia(id) {
  const record = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!record) throw new NotFoundError('Media not found');
  await db.delete(media).where(eq(media.id, id));
}

export async function addManualMapping(mediaId, studentId, userId) {
  const record = await db.query.media.findFirst({ where: eq(media.id, mediaId) });
  if (!record) throw new NotFoundError('Media not found');

  const student = await db.query.students.findFirst({ where: eq(students.id, studentId) });
  if (!student) throw new NotFoundError('Student not found');

  await db
    .insert(mediaMapping)
    .values({ mediaId, studentId, matchedBy: 'manual', matchConfidence: 1 })
    .onDuplicateKeyUpdate({ set: { matchedBy: 'manual', matchConfidence: 1 } });

  emitMediaProcessed({ mediaId, mediaType: record.mediaType, studentIds: [studentId], classId: record.classId });
  return getMediaById(mediaId);
}

export async function removeMapping(mediaId, studentId) {
  await db.delete(mediaMapping).where(and(eq(mediaMapping.mediaId, mediaId), eq(mediaMapping.studentId, studentId)));
}
