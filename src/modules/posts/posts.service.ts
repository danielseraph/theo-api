import { postsRepository } from './posts.repository';
import { CreatePostInput, UpdatePostInput, ListPostsQuery } from './posts.validator';
import { NotFoundError } from '../../types/errors';
import { generateUniqueSlug } from '../../utils/slug';
import { createAuditLog } from '../../utils/audit';
import { buildPaginationMeta } from '../../utils/pagination';

export class PostsService {
  async createPost(input: CreatePostInput, authorId: string, ipAddress?: string) {
    const slug = await generateUniqueSlug(input.title, (s) => postsRepository.slugExists(s));
    const post = await postsRepository.create(input, authorId, slug);

    await createAuditLog({
      userId: authorId,
      action: 'CREATE_POST',
      entity: 'Post',
      entityId: post.id,
      newValues: { title: post.title, slug: post.slug, status: post.status },
      ipAddress,
    });

    return post;
  }

  async getPublishedPosts(query: ListPostsQuery) {
    const posts = await postsRepository.findAll(query, false);
    const total = await postsRepository.count(query, false);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const meta = buildPaginationMeta(total, page, limit);
    return { posts, meta };
  }

  async getPublishedPostBySlug(slug: string) {
    const post = await postsRepository.findBySlug(slug);
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundError('Post not found or not published');
    }
    return post;
  }

  async getAllPosts(query: ListPostsQuery) {
    const posts = await postsRepository.findAll(query, true);
    const total = await postsRepository.count(query, true);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const meta = buildPaginationMeta(total, page, limit);
    return { posts, meta };
  }

  async getPostById(id: string) {
    const post = await postsRepository.findById(id);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return post;
  }

  async updatePost(id: string, input: UpdatePostInput, userId: string, ipAddress?: string) {
    const existing = await this.getPostById(id);
    const updated = await postsRepository.update(id, input);

    await createAuditLog({
      userId,
      action: 'UPDATE_POST',
      entity: 'Post',
      entityId: id,
      oldValues: { title: existing.title, status: existing.status },
      newValues: { title: updated.title, status: updated.status },
      ipAddress,
    });

    return updated;
  }

  async deletePost(id: string, userId: string, ipAddress?: string) {
    await this.getPostById(id);
    await postsRepository.delete(id);

    await createAuditLog({
      userId,
      action: 'DELETE_POST',
      entity: 'Post',
      entityId: id,
      ipAddress,
    });
  }

  async publishPost(id: string, userId: string, ipAddress?: string) {
    const existing = await this.getPostById(id);
    const updated = await postsRepository.publish(id);

    await createAuditLog({
      userId,
      action: 'PUBLISH_POST',
      entity: 'Post',
      entityId: id,
      oldValues: { status: existing.status },
      newValues: { status: updated.status, publishedAt: updated.publishedAt?.toISOString() },
      ipAddress,
    });

    return updated;
  }

  async unpublishPost(id: string, userId: string, ipAddress?: string) {
    const existing = await this.getPostById(id);
    const updated = await postsRepository.unpublish(id);

    await createAuditLog({
      userId,
      action: 'UNPUBLISH_POST',
      entity: 'Post',
      entityId: id,
      oldValues: { status: existing.status },
      newValues: { status: updated.status },
      ipAddress,
    });

    return updated;
  }
}

export const postsService = new PostsService();
