import { Router } from 'express';
import * as auditController from './audit.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();

router.get('/', authenticate, authorize(PERMISSIONS.AUDIT_READ), auditController.listAuditLogs);

export default router;
