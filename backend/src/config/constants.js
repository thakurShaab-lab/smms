export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent'
});

export const PERMISSIONS = Object.freeze({
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
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.TEACHER]: [
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.CLASSES_MANAGE,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.FACE_ENROLL,
    PERMISSIONS.VOICE_ENROLL
  ],
  [ROLES.PARENT]: [PERMISSIONS.MEDIA_READ_OWN_CHILD]
});

export const MEDIA_TYPES = Object.freeze({
  PHOTO: 'photo',
  VIDEO: 'video',
  DOCUMENT: 'document',
  AUDIO: 'audio'
});

export const MEDIA_STATUS = Object.freeze({
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
});

export const FILE_ROLES = Object.freeze({
  ORIGINAL: 'original',
  THUMBNAIL: 'thumbnail',
  PREVIEW: 'preview',
  CONVERTED: 'converted',
  OCR_PAGE: 'ocr_page'
});
