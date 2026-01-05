import { Router } from 'express';
import * as TransactionController from '../controllers/transaction.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Expense and settlement management
 */

router.use(isAuthenticated);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transactions (Feed)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 *   post:
 *     summary: Create an expense
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, description, type]
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [EXPENSE, INCOME, SETTLEMENT]
 *               groupId:
 *                 type: string
 *               splitType:
 *                 type: string
 *                 enum: [EQUAL, EXACT, PERCENTAGE]
 *               splitDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.get('/', TransactionController.getTransactions);
router.post('/', TransactionController.createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
router.delete('/:id', TransactionController.deleteTransaction);

/**
 * @swagger
 * /api/transactions/settle:
 *   post:
 *     summary: Settle debts (Create Settlement)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [toUserId, amount]
 *             properties:
 *               toUserId:
 *                 type: string
 *               amount:
 *                 type: number
 *               groupId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Settlement created
 */
router.post('/settle', TransactionController.settleDebts);

export default router;
