import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

router.use(isAuthenticated);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         currency:
 *           type: string
 *         monthlyLimit:
 *           type: number
 *       example:
 *         id: "60d0fe4f5311236168a109ca"
 *         name: "John Doe"
 *         email: "john@example.com"
 *         avatarUrl: "https://lh3.googleusercontent.com/..."
 *         currency: "USD"
 *         monthlyLimit: 1000
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               currency:
 *                 type: string
 *               monthlyLimit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated user profile
 */
router.get('/me', UserController.getMe);
router.put('/me', UserController.updateMe);

/**
 * @swagger
 * /api/users/me/stats:
 *   get:
 *     summary: Get user financial stats
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats
 */
router.get('/me/stats', UserController.getUserStats);

/**
 * @swagger
 * /api/users/me/preferences:
 *   put:
 *     summary: Update user preferences (currency, monthlyLimit)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, JPY, IDR]
 *               monthlyLimit:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1000000
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.put('/me/preferences', UserController.updatePreferences);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by name or email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/search', UserController.searchUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User data
 */
router.get('/:id', UserController.getUserById);

export default router;
