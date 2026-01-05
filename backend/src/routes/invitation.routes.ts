import { Router } from 'express';
import * as InvitationController from '../controllers/invitation.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

router.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Group invitations
 */

/**
 * @swagger
 * /api/invitations:
 *   get:
 *     summary: Get my pending invitations
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invitations
 *   post:
 *     summary: Send an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [groupId, userId]
 *             properties:
 *               groupId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitation sent
 */
router.get('/', InvitationController.getInvitations);
router.post('/', InvitationController.sendInvitation);

/**
 * @swagger
 * /api/invitations/{id}/respond:
 *   post:
 *     summary: Respond to invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accept]
 *             properties:
 *               accept:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Responded successfully
 */
router.post('/:id/respond', InvitationController.respondInvitation);

export default router;
