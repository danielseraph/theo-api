import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from '../types/errors';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/mpeg',
];

const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];

const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024; // 100 MB

const storage = multer.memoryStorage();

const createFilter =
  (allowedMimes: string[], label: string) =>
  (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid file type. Allowed ${label}: ${allowedMimes.join(', ')}`, 400));
    }
  };

export const uploadImage = multer({
  storage,
  fileFilter: createFilter(ALLOWED_IMAGE_MIMES, 'image types'),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

export const uploadVideo = multer({
  storage,
  fileFilter: createFilter(ALLOWED_VIDEO_MIMES, 'video types'),
  limits: { fileSize: VIDEO_SIZE_LIMIT },
});

export const uploadMedia = multer({
  storage,
  fileFilter: createFilter(ALLOWED_MIMES, 'media types'),
  limits: { fileSize: VIDEO_SIZE_LIMIT },
});

export const ALLOWED_IMAGE_MIME_TYPES = ALLOWED_IMAGE_MIMES;
export const ALLOWED_VIDEO_MIME_TYPES = ALLOWED_VIDEO_MIMES;
