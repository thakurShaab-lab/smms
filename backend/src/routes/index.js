import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import teacherRoutes from '../modules/teachers/teachers.routes.js';
import parentRoutes from '../modules/parents/parents.routes.js';
import classRoutes from '../modules/classes/classes.routes.js';
import studentRoutes from '../modules/students/students.routes.js';
import mediaRoutes from '../modules/media/media.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';
import fileRoutes from '../modules/files/files.routes.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/health', (req, res) => sendSuccess(res, { message: 'SMMS backend is healthy', data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/parents', parentRoutes);
router.use('/classes', classRoutes);
router.use('/students', studentRoutes);
router.use('/media', mediaRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/files', fileRoutes);

export default router;
