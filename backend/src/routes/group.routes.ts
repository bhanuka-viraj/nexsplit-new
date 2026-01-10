import { Router } from 'express';
import * as GroupController from '../controllers/group.controller';
import * as GroupSummaryController from '../controllers/groupSummary.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

router.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Expense groups
 */

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get my groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created
 */
router.get('/', GroupController.getMyGroups);
router.post('/', GroupController.createGroup);

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group details and transactions
 *   put:
 *     summary: Update group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated
 */
router.get('/:id', GroupController.getGroupDetails);
router.put('/:id', GroupController.updateGroup);

/**
 * @swagger
 * /api/groups/{id}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *     responses:
 *       200:
 *         description: Left group
 */
router.post('/:id/leave', GroupController.leaveGroup);

/**
 * @swagger
 * /api/groups/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *       - in: path
 *         name: userId
 *     responses:
 *       200:
 *         description: Member removed
 */
router.delete('/:id/members/:userId', GroupController.removeMember);

/**
 * @swagger
 * /api/groups/:id/summary:
 *   get:
 *     summary: Get calculated group summary with debt breakdown
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *     responses:
 *       200:
 *         description: Group summary with calculated debts
 */
router.get('/:id/summary', GroupSummaryController.getGroupSummary);

export default router;
