import { Router } from 'express';
import * as DebtController from '../controllers/debt.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/debts:
 *   get:
 *     summary: Get user's debt overview across all groups
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Debt overview
 */
router.get('/', isAuthenticated, DebtController.getDebts);

/**
 * @swagger
 * /api/debts/settlements:
 *   get:
 *     summary: Get settlement suggestions
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: strategy
 *         schema:
 *           type: string
 *           enum: [simplified, detailed]
 *         description: Settlement strategy
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Optional group ID to calculate for specific group
 *     responses:
 *       200:
 *         description: Settlement suggestions
 */
router.get('/settlements', isAuthenticated, DebtController.getSettlements);

export default router;
