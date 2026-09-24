import { Router } from 'express';
import { galleryController } from './gallery.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createGalleryItemSchema, updateGalleryItemSchema, listGalleryQuerySchema } from './gallery.validator';

const publicGalleryRouter = Router();
const adminGalleryRouter = Router();

// Public: GET /api/v1/gallery
publicGalleryRouter.get('/', validate(listGalleryQuerySchema, 'query'), galleryController.getGallery);

// Admin: protected
adminGalleryRouter.use(authenticate, authorize('ADMIN'));
adminGalleryRouter.post('/', validate(createGalleryItemSchema), galleryController.createGalleryItem);
adminGalleryRouter.patch('/:id', validate(updateGalleryItemSchema), galleryController.updateGalleryItem);
adminGalleryRouter.delete('/:id', galleryController.deleteGalleryItem);

export { publicGalleryRouter, adminGalleryRouter };
