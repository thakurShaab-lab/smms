import { eq, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { speakerEmbeddings } from '../../db/schema/index.js';
import { buildStorageKey, uploadBuffer, deleteObject, getSignedDownloadUrl } from '../../services/storage.service.js';
import * as pythonAiClient from '../../services/pythonAiClient.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { getStudentById } from './students.service.js';
import { logger } from '../../utils/logger.js';

export async function addVoiceSample(studentId, file) {
  await getStudentById(studentId);

  const storageKey = buildStorageKey({ prefix: `students/${studentId}/voices`, originalFilename: file.originalname });
  await uploadBuffer({ key: storageKey, buffer: file.buffer, contentType: file.mimetype });

  const [insertResult] = await db.insert(speakerEmbeddings).values({
    studentId,
    sourceAudioKey: storageKey,
    isActive: false
  });
  const embeddingId = insertResult.insertId;

  try {
    await db.update(speakerEmbeddings).set({ faissLabel: embeddingId }).where(eq(speakerEmbeddings.id, embeddingId));

    const signedUrl = await getSignedDownloadUrl(storageKey);
    const result = await pythonAiClient.enrollSpeaker({ faissLabel: embeddingId, studentId, audioUrl: signedUrl });

    if (!result?.success) {
      throw new BadRequestError(result?.message || 'No usable voice signal detected in the uploaded audio');
    }

    await db
      .update(speakerEmbeddings)
      .set({ isActive: true, qualityScore: result.quality_score ?? null })
      .where(eq(speakerEmbeddings.id, embeddingId));

    return db.query.speakerEmbeddings.findFirst({ where: eq(speakerEmbeddings.id, embeddingId) });
  } catch (error) {
    await db.delete(speakerEmbeddings).where(eq(speakerEmbeddings.id, embeddingId));
    await deleteObject(storageKey).catch((cleanupError) => {
      logger.error('Failed to clean up orphaned voice sample after enrollment failure', {
        storageKey,
        error: cleanupError.message
      });
    });
    throw error;
  }
}

export async function listVoiceSamples(studentId) {
  await getStudentById(studentId);
  const voices = await db.query.speakerEmbeddings.findMany({
    where: and(eq(speakerEmbeddings.studentId, studentId), eq(speakerEmbeddings.isActive, true)),
    orderBy: (se, { desc }) => [desc(se.createdAt)]
  });

  return Promise.all(
    voices.map(async (voice) => ({ ...voice, url: await getSignedDownloadUrl(voice.sourceAudioKey) }))
  );
}

export async function removeVoiceSample(studentId, voiceId) {
  const voice = await db.query.speakerEmbeddings.findFirst({
    where: and(eq(speakerEmbeddings.id, voiceId), eq(speakerEmbeddings.studentId, studentId))
  });
  if (!voice) throw new NotFoundError('Voice sample not found for this student');

  if (voice.faissLabel != null) {
    await pythonAiClient.removeSpeaker({ faissLabel: voice.faissLabel });
  }
  await db.delete(speakerEmbeddings).where(eq(speakerEmbeddings.id, voiceId));
  await deleteObject(voice.sourceAudioKey).catch((error) => {
    logger.error('Failed to delete voice sample from storage', { key: voice.sourceAudioKey, error: error.message });
  });
}

export async function rebuildFullSpeakerIndex() {
  const activeVoices = await db.query.speakerEmbeddings.findMany({ where: eq(speakerEmbeddings.isActive, true) });

  const entries = await Promise.all(
    activeVoices.map(async (voice) => ({
      faissLabel: voice.faissLabel,
      audioUrl: await getSignedDownloadUrl(voice.sourceAudioKey)
    }))
  );

  return pythonAiClient.rebuildSpeakerIndex({ entries });
}
