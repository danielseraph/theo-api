import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
const controller = new DashboardController();

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard (Admin)]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, authorize('ADMIN', 'EDITOR'), controller.getStats);

export default router;
