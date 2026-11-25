import { eq, inArray, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { faceEmbeddings, speakerEmbeddings, mediaMapping } from '../../db/schema/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Faces come back from the AI service as a list of detections, each carrying
 * FAISS matches keyed by faiss_label (== face_embeddings.id). This resolves
 * those labels to student ids and keeps only the single best match per
 * student, since one student can have several enrolled face images.
 */
export async function resolveFacesToStudentMatches(faces) {
  const allLabels = new Set();
  for (const face of faces || []) {
    for (const match of face.matches || []) {
      allLabels.add(match.faiss_label);
    }
  }
  if (allLabels.size === 0) return [];

  const embeddingRows = await db.query.faceEmbeddings.findMany({
    where: and(inArray(faceEmbeddings.faissLabel, Array.from(allLabels)), eq(faceEmbeddings.isActive, true))
  });
  const labelToStudentId = new Map(embeddingRows.map((row) => [row.faissLabel, row.studentId]));

  const bestByStudent = new Map();
  for (const face of faces || []) {
    for (const match of face.matches || []) {
      const studentId = labelToStudentId.get(match.faiss_label);
      if (!studentId) continue;

      const existing = bestByStudent.get(studentId);
      if (!existing || match.similarity > existing.matchConfidence) {
        bestByStudent.set(studentId, {
          studentId,
          matchConfidence: match.similarity,
          faceBbox: face.bbox ?? null,
          frameTimestamp: face.timestamp ?? null
        });
      }
    }
  }

  return Array.from(bestByStudent.values());
}

/**
 * Same idea as resolveFacesToStudentMatches but for voice: segments come
 * back from the AI service as fixed-length audio windows, each carrying
 * FAISS matches keyed by faiss_label (== speaker_embeddings.id). There is no
 * bbox for audio, so faceBbox is always null on the returned matches.
 */
export async function resolveSpeakerSegmentsToStudentMatches(segments) {
  const allLabels = new Set();
  for (const segment of segments || []) {
    for (const match of segment.matches || []) {
      allLabels.add(match.faiss_label);
    }
  }
  if (allLabels.size === 0) return [];

  const embeddingRows = await db.query.speakerEmbeddings.findMany({
    where: and(inArray(speakerEmbeddings.faissLabel, Array.from(allLabels)), eq(speakerEmbeddings.isActive, true))
  });
  const labelToStudentId = new Map(embeddingRows.map((row) => [row.faissLabel, row.studentId]));

  const bestByStudent = new Map();
  for (const segment of segments || []) {
    for (const match of segment.matches || []) {
      const studentId = labelToStudentId.get(match.faiss_label);
      if (!studentId) continue;

      const existing = bestByStudent.get(studentId);
      if (!existing || match.similarity > existing.matchConfidence) {
        bestByStudent.set(studentId, {
          studentId,
          matchConfidence: match.similarity,
          faceBbox: null,
          frameTimestamp: segment.start_time ?? null
        });
      }
    }
  }

  return Array.from(bestByStudent.values());
}

export async function persistMediaMappings(mediaId, studentMatches, matchedBy = 'ai') {
  const created = [];
  for (const match of studentMatches) {
    try {
      await db.insert(mediaMapping).values({
        mediaId,
        studentId: match.studentId,
        matchConfidence: match.matchConfidence,
        matchedBy,
        faceBbox: match.faceBbox,
        frameTimestamp: match.frameTimestamp ?? null
      });
      created.push(match.studentId);
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') {
        logger.error('Failed to persist media mapping', { mediaId, studentId: match.studentId, error: error.message });
      }
    }
  }
  return created;
}
