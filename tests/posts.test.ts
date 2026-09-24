import { request, createTestAdmin, getAdminToken } from './setup';

describe('Posts', () => {
  let adminToken: string;
  let createdPostId: string;
  let createdPostSlug: string;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminToken = await getAdminToken(admin.email, 'TestPassword@123');
  });

  describe('Admin Post Management', () => {
    it('should create a post in DRAFT status', async () => {
      const postData = {
        title: 'Test Integration Post',
        content: 'This is a test post content',
        status: 'DRAFT'
      };
      const res = await request
        .post('/api/v1/admin/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(postData);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('slug');
      expect(res.body.data.status).toBe('DRAFT');
      
      createdPostId = res.body.data.id;
      createdPostSlug = res.body.data.slug;
    });

    it('should return 401 without authentication', async () => {
      const res = await request.post('/api/v1/admin/posts').send({
        title: 'Unauthorized Post',
        content: 'Content'
      });
      expect(res.status).toBe(401);
    });

    it('should return 422 for invalid post data', async () => {
      const res = await request
        .post('/api/v1/admin/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Missing title'
        });
      expect(res.status).toBe(422);
    });

    it('should get all posts including drafts as admin', async () => {
      const res = await request
        .get('/api/v1/admin/posts')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeInstanceOf(Array);
      const post = res.body.data.items.find((p: any) => p.id === createdPostId);
      expect(post).toBeDefined();
    });

    it('should get post by id', async () => {
      const res = await request
        .get(`/api/v1/admin/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdPostId);
    });

    it('should update a post', async () => {
      const res = await request
        .put(`/api/v1/admin/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Test Post',
          content: 'Updated content'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Test Post');
    });

    it('should publish a post', async () => {
      const res = await request
        .patch(`/api/v1/admin/posts/${createdPostId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('PUBLISHED');
    });

    it('should unpublish a post', async () => {
      const res = await request
        .patch(`/api/v1/admin/posts/${createdPostId}/unpublish`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DRAFT');
    });
  });

  describe('Public Post Access', () => {
    beforeAll(async () => {
      // Create a published post for public access tests
      await request
        .patch(`/api/v1/admin/posts/${createdPostId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should only return PUBLISHED posts on public endpoint', async () => {
      const res = await request.get('/api/v1/posts');
      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeInstanceOf(Array);
      res.body.data.items.forEach((post: any) => {
        expect(post.status).toBe('PUBLISHED');
      });
    });

    it('should get published post by slug', async () => {
      const res = await request.get(`/api/v1/posts/${createdPostSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(createdPostSlug);
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request.get('/api/v1/posts/non-existent-slug-12345');
      expect(res.status).toBe(404);
    });

    it('should NOT return DRAFT posts on public endpoint', async () => {
      // First unpublish it
      await request
        .patch(`/api/v1/admin/posts/${createdPostId}/unpublish`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to access it publicly by slug
      const res = await request.get(`/api/v1/posts/${createdPostSlug}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Admin Post Deletion', () => {
    it('should delete a post', async () => {
      const res = await request
        .delete(`/api/v1/admin/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      
      // Verify deletion
      const getRes = await request
        .get(`/api/v1/admin/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(404);
    });
  });
});
