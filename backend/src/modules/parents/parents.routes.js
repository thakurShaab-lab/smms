import { Router } from 'express';
import * as parentsController from './parents.controller.js';
import {
  createParentSchema,
  updateParentSchema,
  linkStudentSchema,
  parentIdParamSchema,
  listParentsSchema
} from './parents.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.PARENTS_MANAGE));

router.post('/', validate(createParentSchema), parentsController.createParent);
router.get('/', validate(listParentsSchema), parentsController.listParents);
router.get('/:id', validate(parentIdParamSchema), parentsController.getParent);
router.patch('/:id', validate(updateParentSchema), parentsController.updateParent);
router.post('/:id/students', validate(linkStudentSchema), parentsController.linkStudent);
router.delete('/:id/students/:studentId', parentsController.unlinkStudent);

export default router;
