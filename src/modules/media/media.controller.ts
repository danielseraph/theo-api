import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { mediaService } from './media.service';
import { successResponse } from '../../utils/response';
import { AppError } from '../../types/errors';
import { buildPaginationMeta } from '../../utils/pagination';

export class MediaController {
  async uploadMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let file = req.file;
      if (!file && req.files) {
        if (Array.isArray(req.files) && req.files.length > 0) {
          file = req.files[0];
        } else if (typeof req.files === 'object') {
          const fileKeys = Object.keys(req.files);
          if (fileKeys.length > 0) {
            const fieldFiles = (req.files as Record<string, Express.Multer.File[]>)[fileKeys[0]];
            if (fieldFiles && fieldFiles.length > 0) {
              file = fieldFiles[0];
            }
          }
        }
      }

      if (!file) {
        throw new AppError('No file uploaded. Please include a file in the form-data (e.g. key "file" or "image").', 400);
      }
      
      const userId = req.user!.id;
      const ipAddress = req.ip;
      
      const media = await mediaService.uploadMedia(file, userId, ipAddress);
      
      const responseData = {
        ...media,
        url: media.url,
        fileUrl: media.url,
        secure_url: media.url,
        imageUrl: media.url,
      };

      successResponse(res, responseData, 'Media uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total } = await mediaService.getAllMedia(req.query as any);
      
      const pagination = buildPaginationMeta(
        total,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 20
      );
      
      successResponse(res, data, 'Media retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  async deleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      
      await mediaService.deleteMedia(id, userId, ipAddress);
      
      successResponse(res, null, 'Media deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();
