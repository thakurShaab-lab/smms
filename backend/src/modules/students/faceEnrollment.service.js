import { eq, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { faceEmbeddings, students } from '../../db/schema/index.js';
import { buildStorageKey, uploadBuffer, deleteObject, getSignedDownloadUrl } from '../../services/storage.service.js';
import * as pythonAiClient from '../../services/pythonAiClient.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { getStudentById } from './students.service.js';
import { logger } from '../../utils/logger.js';

export async function addFaceImage(studentId, file) {
  await getStudentById(studentId);

  const storageKey = buildStorageKey({ prefix: `students/${studentId}/faces`, originalFilename: file.originalname });
  await uploadBuffer({ key: storageKey, buffer: file.buffer, contentType: file.mimetype });

  const [insertResult] = await db.insert(faceEmbeddings).values({
    studentId,
    sourceImageKey: storageKey,
    isActive: false
  });
  const embeddingId = insertResult.insertId;

  try {
    await db.update(faceEmbeddings).set({ faissLabel: embeddingId }).where(eq(faceEmbeddings.id, embeddingId));

    const signedUrl = await getSignedDownloadUrl(storageKey);
    const result = await pythonAiClient.enrollFace({ faissLabel: embeddingId, studentId, imageUrl: signedUrl });

    if (!result?.success) {
      throw new BadRequestError(result?.message || 'No usable face detected in the uploaded image');
    }

    await db
      .update(faceEmbeddings)
      .set({
        isActive: true,
        qualityScore: result.quality_score ?? null,
        detectionBbox: result.bbox ?? null
      })
      .where(eq(faceEmbeddings.id, embeddingId));

    return db.query.faceEmbeddings.findFirst({ where: eq(faceEmbeddings.id, embeddingId) });
  } catch (error) {
    await db.delete(faceEmbeddings).where(eq(faceEmbeddings.id, embeddingId));
    await deleteObject(storageKey).catch((cleanupError) => {
      logger.error('Failed to clean up orphaned face image after enrollment failure', {
        storageKey,
        error: cleanupError.message
      });
    });
    throw error;
  }
}

export async function listFaceImages(studentId) {
  await getStudentById(studentId);
  const faces = await db.query.faceEmbeddings.findMany({
    where: and(eq(faceEmbeddings.studentId, studentId), eq(faceEmbeddings.isActive, true)),
    orderBy: (fe, { desc }) => [desc(fe.createdAt)]
  });

  return Promise.all(
    faces.map(async (face) => ({ ...face, url: await getSignedDownloadUrl(face.sourceImageKey) }))
  );
}

export async function removeFaceImage(studentId, faceId) {
  const face = await db.query.faceEmbeddings.findFirst({
    where: and(eq(faceEmbeddings.id, faceId), eq(faceEmbeddings.studentId, studentId))
  });
  if (!face) throw new NotFoundError('Face image not found for this student');

  if (face.faissLabel != null) {
    await pythonAiClient.removeFace({ faissLabel: face.faissLabel });
  }
  await db.delete(faceEmbeddings).where(eq(faceEmbeddings.id, faceId));
  await deleteObject(face.sourceImageKey).catch((error) => {
    logger.error('Failed to delete face image from storage', { key: face.sourceImageKey, error: error.message });
  });
}

export async function rebuildFullFaceIndex() {
  const activeFaces = await db.query.faceEmbeddings.findMany({ where: eq(faceEmbeddings.isActive, true) });

  const entries = await Promise.all(
    activeFaces.map(async (face) => ({
      faissLabel: face.faissLabel,
      imageUrl: await getSignedDownloadUrl(face.sourceImageKey)
    }))
  );

  return pythonAiClient.rebuildFaceIndex({ entries });
}
