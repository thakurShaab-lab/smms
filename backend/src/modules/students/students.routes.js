import { Router } from 'express';
import * as studentsController from './students.controller.js';
import {
  createStudentSchema,
  updateStudentSchema,
  listStudentsSchema,
  studentIdParamSchema,
  faceIdParamSchema,
  voiceIdParamSchema
} from './students.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { uploadFaceImage, uploadVoiceSample } from '../../middleware/upload.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.STUDENTS_CREATE),
  validate(createStudentSchema),
  studentsController.createStudent
);
router.get('/', authorize(PERMISSIONS.STUDENTS_READ), validate(listStudentsSchema), studentsController.listStudents);
router.post(
  '/face-index/rebuild',
  authorize(PERMISSIONS.FACE_ENROLL),
  studentsController.rebuildFaceIndex
);
router.get(
  '/:id',
  authorize(PERMISSIONS.STUDENTS_READ),
  validate(studentIdParamSchema),
  studentsController.getStudent
);
router.patch(
  '/:id',
  authorize(PERMISSIONS.STUDENTS_UPDATE),
  validate(updateStudentSchema),
  studentsController.updateStudent
);
router.delete(
  '/:id',
  authorize(PERMISSIONS.STUDENTS_DELETE),
  validate(studentIdParamSchema),
  studentsController.deleteStudent
);

router.get(
  '/:id/faces',
  authorize(PERMISSIONS.STUDENTS_READ),
  validate(studentIdParamSchema),
  studentsController.listFaceImages
);
router.post(
  '/:id/faces',
  authorize(PERMISSIONS.FACE_ENROLL),
  validate(studentIdParamSchema),
  uploadFaceImage.single('faceImage'),
  studentsController.addFaceImage
);
router.delete(
  '/:id/faces/:faceId',
  authorize(PERMISSIONS.FACE_ENROLL),
  validate(faceIdParamSchema),
  studentsController.removeFaceImage
);

router.post(
  '/voice-index/rebuild',
  authorize(PERMISSIONS.VOICE_ENROLL),
  studentsController.rebuildSpeakerIndex
);

router.get(
  '/:id/voices',
  authorize(PERMISSIONS.STUDENTS_READ),
  validate(studentIdParamSchema),
  studentsController.listVoiceSamples
);
router.post(
  '/:id/voices',
  authorize(PERMISSIONS.VOICE_ENROLL),
  validate(studentIdParamSchema),
  uploadVoiceSample.single('voiceSample'),
  studentsController.addVoiceSample
);
router.delete(
  '/:id/voices/:voiceId',
  authorize(PERMISSIONS.VOICE_ENROLL),
  validate(voiceIdParamSchema),
  studentsController.removeVoiceSample
);

export default router;
