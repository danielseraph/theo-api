import { Router } from 'express';
import { RegistrationsController } from './registrations.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createRegistrationSchema, listRegistrationsQuerySchema } from './registrations.validator';

const publicRouter = Router();
const adminRouter = Router();
const controller = new RegistrationsController();

/**
 * @swagger
 * /api/v1/registrations:
 *   post:
 *     summary: Register as a new community member
 *     tags: [Registrations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               areaOfInterest:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Optional. Omit for passwordless registration.
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email already registered
 *       422:
 *         description: Validation error
 */
publicRouter.post('/', validate(createRegistrationSchema), controller.register);

adminRouter.use(authenticate);
adminRouter.use(authorize('ADMIN', 'EDITOR'));

/**
 * @swagger
 * /api/v1/admin/registrations:
 *   get:
 *     summary: List all registrations (admin)
 *     tags: [Admin - Registrations]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of registrations
 */
adminRouter.get(
  '/',
  validate(listRegistrationsQuerySchema, 'query'),
  controller.getAllRegistrations
);

/**
 * @swagger
 * /api/v1/admin/registrations/{id}:
 *   get:
 *     summary: Get a registration by ID (admin)
 *     tags: [Admin - Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registration data
 *       404:
 *         description: Registration not found
 */
adminRouter.get('/:id', controller.getRegistrationById);

export { publicRouter, adminRouter };
