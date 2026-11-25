import { Router } from 'express';
import * as classesController from './classes.controller.js';
import {
  createClassSchema,
  updateClassSchema,
  createSectionSchema,
  updateSectionSchema,
  idParamSchema
} from './classes.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', classesController.listClasses);
router.get('/:id', validate(idParamSchema), classesController.getClass);
router.post('/', authorize(PERMISSIONS.CLASSES_MANAGE), validate(createClassSchema), classesController.createClass);
router.patch('/:id', authorize(PERMISSIONS.CLASSES_MANAGE), validate(updateClassSchema), classesController.updateClass);
router.delete('/:id', authorize(PERMISSIONS.CLASSES_MANAGE), validate(idParamSchema), classesController.deleteClass);

router.post(
  '/sections',
  authorize(PERMISSIONS.CLASSES_MANAGE),
  validate(createSectionSchema),
  classesController.createSection
);
router.patch(
  '/sections/:id',
  authorize(PERMISSIONS.CLASSES_MANAGE),
  validate(updateSectionSchema),
  classesController.updateSection
);
router.delete(
  '/sections/:id',
  authorize(PERMISSIONS.CLASSES_MANAGE),
  validate(idParamSchema),
  classesController.deleteSection
);

export default router;
