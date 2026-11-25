import { mysqlTable, varchar, timestamp, int, bigint, boolean, float, json } from 'drizzle-orm/mysql-core';
import { students } from './students.js';

/**
 * faissLabel is the integer id used as the FAISS vector label (IndexIDMap).
 * The 512-d ArcFace embedding itself is kept only inside the Python service's
 * FAISS index + embeddings.npy sidecar; MySQL stores the pointer + metadata
 * so the index can be rebuilt deterministically from source images.
 */
export const faceEmbeddings = mysqlTable('face_embeddings', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  studentId: bigint('student_id', { mode: 'number' })
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  faissLabel: bigint('faiss_label', { mode: 'number' }).unique(),
  sourceImageKey: varchar('source_image_key', { length: 500 }).notNull(),
  qualityScore: float('quality_score'),
  detectionBbox: json('detection_bbox'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});
