import { Request, Response, NextFunction } from 'express';
import { galleryService } from './gallery.service';
import { successResponse } from '../../utils/response';

export class GalleryController {
  async getGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, meta } = await galleryService.getGalleryItems(req.query as any);
      successResponse(res, items, 'Gallery items retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async createGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await galleryService.createGalleryItem(req.body);
      successResponse(res, item, 'Gallery item created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await galleryService.updateGalleryItem(id, req.body);
      successResponse(res, item, 'Gallery item updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await galleryService.deleteGalleryItem(id);
      successResponse(res, null, 'Gallery item deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const galleryController = new GalleryController();
