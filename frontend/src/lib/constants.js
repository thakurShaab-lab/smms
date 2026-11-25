export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent'
};

export const PERMISSIONS = {
  STUDENTS_CREATE: 'students:create',
  STUDENTS_READ: 'students:read',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',
  TEACHERS_MANAGE: 'teachers:manage',
  PARENTS_MANAGE: 'parents:manage',
  CLASSES_MANAGE: 'classes:manage',
  MEDIA_UPLOAD: 'media:upload',
  MEDIA_READ: 'media:read',
  MEDIA_DELETE: 'media:delete',
  MEDIA_READ_OWN_CHILD: 'media:read_own_child',
  FACE_ENROLL: 'face:enroll',
  VOICE_ENROLL: 'voice:enroll',
  AUDIT_READ: 'audit:read'
};

export const MEDIA_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
  DOCUMENT: 'document',
  AUDIO: 'audio'
};
