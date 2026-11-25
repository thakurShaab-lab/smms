import { Router } from 'express';
import * as teachersController from './teachers.controller.js';
import {
  createTeacherSchema,
  updateTeacherSchema,
  listTeachersSchema,
  teacherIdParamSchema
} from './teachers.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(PERMISSIONS.TEACHERS_MANAGE), validate(createTeacherSchema), teachersController.createTeacher);
router.get('/', authorize(PERMISSIONS.TEACHERS_MANAGE), validate(listTeachersSchema), teachersController.listTeachers);
router.get('/:id', authorize(PERMISSIONS.TEACHERS_MANAGE), validate(teacherIdParamSchema), teachersController.getTeacher);
router.patch('/:id', authorize(PERMISSIONS.TEACHERS_MANAGE), validate(updateTeacherSchema), teachersController.updateTeacher);
router.delete('/:id', authorize(PERMISSIONS.TEACHERS_MANAGE), validate(teacherIdParamSchema), teachersController.deleteTeacher);

export default router;
