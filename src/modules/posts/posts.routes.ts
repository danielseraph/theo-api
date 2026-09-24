import { Router } from 'express';
import { postsController } from './posts.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createPostSchema, updatePostSchema, listPostsQuerySchema } from './posts.validator';

const publicPostsRouter = Router();
const adminPostsRouter = Router();

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get published posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of published posts
 */
publicPostsRouter.get('/', validate(listPostsQuerySchema, 'query'), postsController.getPublishedPosts);

/**
 * @swagger
 * /api/v1/posts/{slug}:
 *   get:
 *     summary: Get a published post by slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post data
 *       404:
 *         description: Post not found
 */
publicPostsRouter.get('/:slug', postsController.getPublishedPostBySlug);

// Apply auth middleware to all admin routes
adminPostsRouter.use(authenticate, authorize('ADMIN', 'EDITOR'));

/**
 * @swagger
 * /api/v1/admin/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Admin Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: Post created successfully
 */
adminPostsRouter.post('/', validate(createPostSchema, 'body'), postsController.createPost);

/**
 * @swagger
 * /api/v1/admin/posts:
 *   get:
 *     summary: Get all posts (admin view)
 *     tags: [Admin Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all posts
 */
adminPostsRouter.get('/', validate(listPostsQuerySchema, 'query'), postsController.getAllPosts);

/**
 * @swagger
 * /api/v1/admin/posts/{id}:
 *   get:
 *     summary: Get any post by ID
 *     tags: [Admin Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post data
 */
adminPostsRouter.get('/:id', postsController.getPostById);

/**
 * @swagger
 * /api/v1/admin/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Admin Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostInput'
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
adminPostsRouter.put('/:id', validate(updatePostSchema, 'body'), postsController.updatePost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Admin Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
adminPostsRouter.delete('/:id', postsController.deletePost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}/publish:
 *   patch:
 *     summary: Publish a post
 *     tags: [Admin Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post published successfully
 */
adminPostsRouter.patch('/:id/publish', postsController.publishPost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}/unpublish:
 *   patch:
 *     summary: Unpublish a post
 *     tags: [Admin Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post unpublished successfully
 */
adminPostsRouter.patch('/:id/unpublish', postsController.unpublishPost);

export { publicPostsRouter as postPublicRouter, adminPostsRouter as postAdminRouter };
