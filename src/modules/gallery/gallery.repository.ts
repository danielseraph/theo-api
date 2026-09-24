import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { CreateGalleryItemInput, UpdateGalleryItemInput, ListGalleryQuery } from './gallery.validator';

export class GalleryRepository {
  async create(data: CreateGalleryItemInput) {
    return prisma.galleryItem.create({ data });
  }

  async findById(id: string) {
    return prisma.galleryItem.findUnique({ where: { id } });
  }

  async findAll(params: ListGalleryQuery) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GalleryItemWhereInput = {};
    if (params.category) where.category = params.category;
    if (params.mediaType) where.mediaType = params.mediaType;

    return prisma.galleryItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(params: ListGalleryQuery) {
    const where: Prisma.GalleryItemWhereInput = {};
    if (params.category) where.category = params.category;
    if (params.mediaType) where.mediaType = params.mediaType;
    return prisma.galleryItem.count({ where });
  }

  async update(id: string, data: UpdateGalleryItemInput) {
    return prisma.galleryItem.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.galleryItem.delete({ where: { id } });
  }
}

export const galleryRepository = new GalleryRepository();
