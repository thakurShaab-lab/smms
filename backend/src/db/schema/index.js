import { relations } from 'drizzle-orm';

export * from './rbac.js';
export * from './users.js';
export * from './auth.js';
export * from './teachers.js';
export * from './parents.js';
export * from './classes.js';
export * from './students.js';
export * from './faceEmbeddings.js';
export * from './speakerEmbeddings.js';
export * from './media.js';
export * from './audit.js';

import { roles, permissions, rolePermissions } from './rbac.js';
import { users } from './users.js';
import { sessions, refreshTokens } from './auth.js';
import { teachers } from './teachers.js';
import { parents, studentParents } from './parents.js';
import { classes, sections } from './classes.js';
import { students } from './students.js';
import { faceEmbeddings } from './faceEmbeddings.js';
import { speakerEmbeddings } from './speakerEmbeddings.js';
import { media, mediaFiles, mediaMetadata, mediaMapping, ocrResults } from './media.js';

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions)
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] })
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
  parent: one(parents, { fields: [users.id], references: [parents.userId] }),
  sessions: many(sessions),
  refreshTokens: many(refreshTokens)
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  refreshTokens: many(refreshTokens)
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
  session: one(sessions, { fields: [refreshTokens.sessionId], references: [sessions.id] })
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  media: many(media)
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, { fields: [parents.userId], references: [users.id] }),
  studentParents: many(studentParents)
}));

export const classesRelations = relations(classes, ({ many }) => ({
  sections: many(sections),
  students: many(students)
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  class: one(classes, { fields: [sections.classId], references: [classes.id] }),
  students: many(students)
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  section: one(sections, { fields: [students.sectionId], references: [sections.id] }),
  faceEmbeddings: many(faceEmbeddings),
  speakerEmbeddings: many(speakerEmbeddings),
  studentParents: many(studentParents),
  mediaMappings: many(mediaMapping)
}));

export const studentParentsRelations = relations(studentParents, ({ one }) => ({
  student: one(students, { fields: [studentParents.studentId], references: [students.id] }),
  parent: one(parents, { fields: [studentParents.parentId], references: [parents.id] })
}));

export const faceEmbeddingsRelations = relations(faceEmbeddings, ({ one }) => ({
  student: one(students, { fields: [faceEmbeddings.studentId], references: [students.id] })
}));

export const speakerEmbeddingsRelations = relations(speakerEmbeddings, ({ one }) => ({
  student: one(students, { fields: [speakerEmbeddings.studentId], references: [students.id] })
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  teacher: one(teachers, { fields: [media.uploadedByTeacherId], references: [teachers.id] }),
  class: one(classes, { fields: [media.classId], references: [classes.id] }),
  section: one(sections, { fields: [media.sectionId], references: [sections.id] }),
  files: many(mediaFiles),
  metadata: one(mediaMetadata, { fields: [media.id], references: [mediaMetadata.mediaId] }),
  mappings: many(mediaMapping),
  ocrResult: one(ocrResults, { fields: [media.id], references: [ocrResults.mediaId] })
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  media: one(media, { fields: [mediaFiles.mediaId], references: [media.id] })
}));

export const mediaMappingRelations = relations(mediaMapping, ({ one }) => ({
  media: one(media, { fields: [mediaMapping.mediaId], references: [media.id] }),
  student: one(students, { fields: [mediaMapping.studentId], references: [students.id] })
}));

export const ocrResultsRelations = relations(ocrResults, ({ one }) => ({
  media: one(media, { fields: [ocrResults.mediaId], references: [media.id] }),
  matchedStudent: one(students, { fields: [ocrResults.matchedStudentId], references: [students.id] })
}));
