import prisma from '../../config/database';
import { Prisma, PostStatus } from '@prisma/client';
import { CreatePostInput, UpdatePostInput, ListPostsQuery } from './posts.validator';

export class PostsRepository {
  async create(data: CreatePostInput, authorId: string, slug: string) {
    return prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        category: data.category,
        coverImageUrl: data.coverImageUrl,
        mediaType: data.mediaType || 'NONE',
        mediaUrl: data.mediaUrl,
        mediaId: data.mediaId,
        status: data.status || 'DRAFT',
        authorId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll(params: ListPostsQuery, adminView: boolean) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {};
    
    if (!adminView) {
      where.status = 'PUBLISHED';
    } else if (params.status) {
      where.status = params.status;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const sortField = params.sort || 'createdAt';
    const sortOrder = params.order || 'desc';

    return prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async count(params: ListPostsQuery, adminView: boolean) {
    const where: Prisma.PostWhereInput = {};
    
    if (!adminView) {
      where.status = 'PUBLISHED';
    } else if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return prisma.post.count({ where });
  }

  async update(id: string, data: UpdatePostInput) {
    return prisma.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  }

  async publish(id: string) {
    return prisma.post.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async unpublish(id: string) {
    return prisma.post.update({
      where: { id },
      data: { status: 'DRAFT', publishedAt: null },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async slugExists(slug: string) {
    const count = await prisma.post.count({ where: { slug } });
    return count > 0;
  }
}

export const postsRepository = new PostsRepository();
