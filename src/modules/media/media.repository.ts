import prisma from '../../config/database';
import { Prisma, MediaType } from '@prisma/client';
import { ListMediaQuery } from './media.validator';

export class MediaRepository {
  async create(data: Prisma.MediaCreateInput) {
    return prisma.media.create({ data });
  }

  async findById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  }

  async findAll(params: ListMediaQuery) {
    const { page = 1, limit = 20, type, sort = 'createdAt', order = 'desc' } = params;
    
    const where: Prisma.MediaWhereInput = type ? { type: type as MediaType } : {};
    
    return prisma.media.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
    });
  }

  async count(params: { type?: string }) {
    const where: Prisma.MediaWhereInput = params.type ? { type: params.type as MediaType } : {};
    return prisma.media.count({ where });
  }

  async delete(id: string) {
    return prisma.media.delete({ where: { id } });
  }
}

export const mediaRepository = new MediaRepository();
