import { Router } from 'express';
import * as DashboardController from '../controllers/dashboard.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

router.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregated data
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/summary', DashboardController.getDashboardSummary);

export default router;
