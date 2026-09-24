import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../../config/cloudinary';
import { mediaRepository } from './media.repository';
import { NotFoundError } from '../../types/errors';
import { MediaType } from '@prisma/client';
import { ListMediaQuery } from './media.validator';
import { createAuditLog } from '../../utils/audit';

export class MediaService {
  async uploadMedia(file: Express.Multer.File, userId: string, ipAddress?: string) {
    const isVideo = file.mimetype.startsWith('video/');
    const type = isVideo ? MediaType.VIDEO : MediaType.IMAGE;

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: isVideo ? 'video' : 'image', folder: isVideo ? 'community/videos' : 'community/images' },
        (error, result) => {
          if (error || !result) reject(error || new Error('Upload failed'));
          else resolve(result);
        }
      ).end(file.buffer);
    });

    const media = await mediaRepository.create({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname
    });

    await createAuditLog({
      userId,
      action: 'UPLOAD_MEDIA',
      entity: 'Media',
      entityId: media.id,
      ipAddress
    });

    return media;
  }

  async getAllMedia(query: ListMediaQuery) {
    const data = await mediaRepository.findAll(query);
    const total = await mediaRepository.count({ type: query.type });
    return { data, total };
  }
  
  async deleteMedia(id: string, userId: string, ipAddress?: string) {
    const media = await mediaRepository.findById(id);
    if (!media) throw new NotFoundError('Media not found');

    await cloudinary.uploader.destroy(media.publicId);
    await mediaRepository.delete(id);

    await createAuditLog({
      userId,
      action: 'DELETE_MEDIA',
      entity: 'Media',
      entityId: id,
      ipAddress
    });
  }
}

export const mediaService = new MediaService();
