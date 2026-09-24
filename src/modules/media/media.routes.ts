import { Router } from 'express';
import { mediaController } from './media.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadMedia } from '../../middleware/upload';
import { listMediaQuerySchema } from './media.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media upload and management
 */

router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/admin/media:
 *   post:
 *     summary: Upload media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 */
router.post('/', uploadMedia.single('file'), mediaController.uploadMedia);

/**
 * @swagger
 * /api/v1/admin/media:
 *   get:
 *     summary: Get all media files
 *     tags: [Media]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IMAGE, VIDEO]
 *     responses:
 *       200:
 *         description: List of media files
 */
router.get('/', validate(listMediaQuerySchema, 'query'), mediaController.getAllMedia);

/**
 * @swagger
 * /api/v1/admin/media/{id}:
 *   delete:
 *     summary: Delete media file
 *     tags: [Media]
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
 *         description: Media deleted successfully
 */
router.delete('/:id', mediaController.deleteMedia);

export default router;
