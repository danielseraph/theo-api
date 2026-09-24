import { Request, Response, NextFunction } from 'express';
import { postsService } from './posts.service';
import { AuthenticatedRequest } from '../../types';
import { successResponse } from '../../utils/response';
import { CreatePostInput, UpdatePostInput, ListPostsQuery } from './posts.validator';

export class PostsController {
  public async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const input = req.body as CreatePostInput;
      const post = await postsService.createPost(input, authReq.user!.id, req.ip);
      successResponse(res, post, 'Post created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async getPublishedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListPostsQuery;
      const { posts, meta } = await postsService.getPublishedPosts(query);
      successResponse(res, posts, 'Published posts retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  public async getPublishedPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const post = await postsService.getPublishedPostBySlug(slug);
      successResponse(res, post, 'Post retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListPostsQuery;
      const { posts, meta } = await postsService.getAllPosts(query);
      successResponse(res, posts, 'All posts retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  public async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const post = await postsService.getPostById(id);
      successResponse(res, post, 'Post retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const input = req.body as UpdatePostInput;
      const post = await postsService.updatePost(id, input, authReq.user!.id, req.ip);
      successResponse(res, post, 'Post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      await postsService.deletePost(id, authReq.user!.id, req.ip);
      successResponse(res, null, 'Post deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public async publishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const post = await postsService.publishPost(id, authReq.user!.id, req.ip);
      successResponse(res, post, 'Post published successfully');
    } catch (error) {
      next(error);
    }
  }

  public async unpublishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const post = await postsService.unpublishPost(id, authReq.user!.id, req.ip);
      successResponse(res, post, 'Post unpublished successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const postsController = new PostsController();
