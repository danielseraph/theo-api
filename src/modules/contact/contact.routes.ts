import { Router } from 'express';
import { contactController } from './contact.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createContactSchema, listContactMessagesQuerySchema, updateContactStatusSchema } from './contact.validator';

const publicRouter = Router();
const adminRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact message management
 */

/**
 * @swagger
 * /api/v1/contact:
 *   post:
 *     summary: Submit a contact message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message submitted successfully
 */
publicRouter.post('/', validate(createContactSchema), contactController.submitContact);

adminRouter.use(authenticate);
adminRouter.use(authorize('ADMIN', 'EDITOR'));

/**
 * @swagger
 * /api/v1/admin/contact-messages:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contact messages
 */
adminRouter.get('/', validate(listContactMessagesQuerySchema, 'query'), contactController.getAllMessages);

/**
 * @swagger
 * /api/v1/admin/contact-messages/{id}:
 *   get:
 *     summary: Get contact message by ID
 *     tags: [Contact]
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
 *         description: Contact message
 */
adminRouter.get('/:id', contactController.getMessageById);

/**
 * @swagger
 * /api/v1/admin/contact-messages/{id}/status:
 *   patch:
 *     summary: Update contact message status
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, READ, IN_PROGRESS, RESOLVED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
adminRouter.patch('/:id/status', validate(updateContactStatusSchema), contactController.updateMessageStatus);

export { publicRouter as contactPublicRouter, adminRouter as contactAdminRouter };
