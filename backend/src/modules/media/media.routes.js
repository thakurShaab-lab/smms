import { Router } from 'express';
import * as mediaController from './media.controller.js';
import {
  uploadMediaSchema,
  listMediaSchema,
  mediaIdParamSchema,
  manualMappingSchema,
  removeMappingParamSchema
} from './media.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { uploadMedia } from '../../middleware/upload.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.post(
  '/photos',
  authorize(PERMISSIONS.MEDIA_UPLOAD),
  uploadMedia.single('file'),
  validate(uploadMediaSchema),
  mediaController.uploadPhoto
);
router.post(
  '/videos',
  authorize(PERMISSIONS.MEDIA_UPLOAD),
  uploadMedia.single('file'),
  validate(uploadMediaSchema),
  mediaController.uploadVideo
);
router.post(
  '/documents',
  authorize(PERMISSIONS.MEDIA_UPLOAD),
  uploadMedia.single('file'),
  validate(uploadMediaSchema),
  mediaController.uploadDocument
);
router.post(
  '/audio',
  authorize(PERMISSIONS.MEDIA_UPLOAD),
  uploadMedia.single('file'),
  validate(uploadMediaSchema),
  mediaController.uploadAudio
);

router.get(
  '/',
  authorize(PERMISSIONS.MEDIA_READ, PERMISSIONS.MEDIA_READ_OWN_CHILD),
  validate(listMediaSchema),
  mediaController.listMedia
);
router.get(
  '/:id',
  authorize(PERMISSIONS.MEDIA_READ, PERMISSIONS.MEDIA_READ_OWN_CHILD),
  validate(mediaIdParamSchema),
  mediaController.getMedia
);
router.delete(
  '/:id',
  authorize(PERMISSIONS.MEDIA_DELETE),
  validate(mediaIdParamSchema),
  mediaController.deleteMedia
);

router.post(
  '/:id/mappings',
  authorize(PERMISSIONS.MEDIA_UPLOAD),
  validate(manualMappingSchema),
  mediaController.addManualMapping
);
router.delete(
  '/:id/mappings/:studentId',
  authorize(PERMISSIONS.MEDIA_UPLOAD),
  validate(removeMappingParamSchema),
  mediaController.removeMapping
);

export default router;
