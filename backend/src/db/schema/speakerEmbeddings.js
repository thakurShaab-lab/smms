import { mysqlTable, varchar, timestamp, bigint, boolean, float } from 'drizzle-orm/mysql-core';
import { students } from './students.js';

/**
 * Mirrors face_embeddings but for voice biometrics: faissLabel is the
 * integer label in a SEPARATE FAISS index (192-d ECAPA-TDNN speaker
 * embeddings, distinct from the 512-d ArcFace face index), so a face
 * embedding id and a speaker embedding id are independent label spaces
 * even though both happen to be small integers.
 */
export const speakerEmbeddings = mysqlTable('speaker_embeddings', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  studentId: bigint('student_id', { mode: 'number' })
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  faissLabel: bigint('faiss_label', { mode: 'number' }).unique(),
  sourceAudioKey: varchar('source_audio_key', { length: 500 }).notNull(),
  qualityScore: float('quality_score'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});
