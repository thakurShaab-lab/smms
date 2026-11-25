import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  bigint,
  mysqlEnum,
  json,
  float,
  text,
  unique
} from 'drizzle-orm/mysql-core';
import { teachers } from './teachers.js';
import { classes, sections } from './classes.js';
import { students } from './students.js';

export const media = mysqlTable('media', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  uploadedByTeacherId: bigint('uploaded_by_teacher_id', { mode: 'number' })
    .notNull()
    .references(() => teachers.id, { onDelete: 'restrict' }),
  mediaType: mysqlEnum('media_type', ['photo', 'video', 'document', 'audio']).notNull(),
  status: mysqlEnum('status', ['uploaded', 'processing', 'completed', 'failed']).default('uploaded').notNull(),
  processingError: varchar('processing_error', { length: 500 }),
  originalStorageKey: varchar('original_storage_key', { length: 500 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  classId: int('class_id').references(() => classes.id, { onDelete: 'set null' }),
  sectionId: bigint('section_id', { mode: 'number' }).references(() => sections.id, { onDelete: 'set null' }),
  capturedAt: timestamp('captured_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const mediaFiles = mysqlTable('media_files', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  mediaId: bigint('media_id', { mode: 'number' })
    .notNull()
    .references(() => media.id, { onDelete: 'cascade' }),
  fileRole: mysqlEnum('file_role', ['original', 'thumbnail', 'preview', 'converted', 'ocr_page']).notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  width: int('width'),
  height: int('height'),
  durationSeconds: float('duration_seconds'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const mediaMetadata = mysqlTable('media_metadata', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  mediaId: bigint('media_id', { mode: 'number' })
    .notNull()
    .unique()
    .references(() => media.id, { onDelete: 'cascade' }),
  width: int('width'),
  height: int('height'),
  durationSeconds: float('duration_seconds'),
  codec: varchar('codec', { length: 50 }),
  fps: float('fps'),
  frameCount: int('frame_count'),
  extra: json('extra'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const mediaMapping = mysqlTable(
  'media_mapping',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    mediaId: bigint('media_id', { mode: 'number' })
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    studentId: bigint('student_id', { mode: 'number' })
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    matchConfidence: float('match_confidence'),
    matchedBy: mysqlEnum('matched_by', ['ai', 'manual']).default('ai').notNull(),
    faceBbox: json('face_bbox'),
    frameTimestamp: float('frame_timestamp'),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => ({
    mediaStudentUnique: unique('media_student_unique').on(table.mediaId, table.studentId)
  })
);

export const ocrResults = mysqlTable('ocr_results', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  mediaId: bigint('media_id', { mode: 'number' })
    .notNull()
    .unique()
    .references(() => media.id, { onDelete: 'cascade' }),
  rawText: text('raw_text'),
  extractedStudentName: varchar('extracted_student_name', { length: 150 }),
  extractedAdmissionNumber: varchar('extracted_admission_number', { length: 50 }),
  extractedRollNumber: varchar('extracted_roll_number', { length: 20 }),
  extractedClassName: varchar('extracted_class_name', { length: 50 }),
  extractedSectionName: varchar('extracted_section_name', { length: 50 }),
  matchedStudentId: bigint('matched_student_id', { mode: 'number' }).references(() => students.id, {
    onDelete: 'set null'
  }),
  confidence: float('confidence'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
