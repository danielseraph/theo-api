import { request, createTestAdmin, getAdminToken } from './setup';

describe('Registrations', () => {
  let adminToken: string;
  const testEmail = `user-${Date.now()}@test.com`;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminToken = await getAdminToken(admin.email, 'TestPassword@123');
  });

  describe('POST /api/v1/registrations', () => {
    it('should register a new user successfully', async () => {
      const res = await request.post('/api/v1/registrations').send({
        firstName: 'John',
        lastName: 'Doe',
        email: testEmail,
        password: 'StrongPassword!123',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email', testEmail);
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request.post('/api/v1/registrations').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: testEmail, // Using the same email registered above
        password: 'StrongPassword!123',
      });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request.post('/api/v1/registrations').send({
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'invalid-email-format',
        password: 'StrongPassword!123',
      });
      expect(res.status).toBe(422);
    });

    it('should return 422 for weak password', async () => {
      const res = await request.post('/api/v1/registrations').send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: `alice-${Date.now()}@test.com`,
        password: 'weak',
      });
      expect(res.status).toBe(422);
    });

    it('should return 422 for missing required fields', async () => {
      const res = await request.post('/api/v1/registrations').send({
        email: `missing-${Date.now()}@test.com`,
        password: 'StrongPassword!123',
      });
      expect(res.status).toBe(422);
    });

    it('should never return passwordHash in response', async () => {
      const res = await request.post('/api/v1/registrations').send({
        firstName: 'Charlie',
        lastName: 'Brown',
        email: `charlie-${Date.now()}@test.com`,
        password: 'StrongPassword!123',
      });
      expect(res.status).toBe(201);
      expect(res.body.data).not.toHaveProperty('passwordHash');
      expect(res.body.data).not.toHaveProperty('password');
    });
  });

  describe('GET /api/v1/admin/registrations', () => {
    it('should return paginated list for admin', async () => {
      const res = await request
        .get('/api/v1/admin/registrations')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('meta');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request.get('/api/v1/admin/registrations');
      expect(res.status).toBe(401);
    });

    it('should support search query', async () => {
      const res = await request
        .get(`/api/v1/admin/registrations?search=${testEmail}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0].email).toBe(testEmail);
    });

    it('should support pagination', async () => {
      const res = await request
        .get('/api/v1/admin/registrations?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeLessThanOrEqual(1);
      expect(res.body.data.meta).toHaveProperty('totalPages');
      expect(res.body.data.meta).toHaveProperty('currentPage', 1);
    });
  });
});
