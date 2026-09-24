import { request, createTestAdmin } from './setup';

describe('Auth', () => {
  let adminEmail: string;
  const adminPassword = 'TestPassword@123';
  let validRefreshToken: string;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminEmail = admin.email;
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials and return tokens', async () => {
      const res = await request.post('/api/v1/auth/login').send({ email: adminEmail, password: adminPassword });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).toHaveProperty('email', adminEmail);
      validRefreshToken = res.body.data.refreshToken;
    });

    it('should return 422 for missing fields', async () => {
      const res = await request.post('/api/v1/auth/login').send({ email: adminEmail }); // Missing password
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for invalid password', async () => {
      const res = await request.post('/api/v1/auth/login').send({ email: adminEmail, password: 'WrongPassword!123' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request.post('/api/v1/auth/login').send({ email: 'nobody@test.com', password: adminPassword });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email format', async () => {
      const res = await request.post('/api/v1/auth/login').send({ email: 'not-an-email', password: adminPassword });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new access token with valid refresh token', async () => {
      const res = await request.post('/api/v1/auth/refresh').send({ refreshToken: validRefreshToken });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const res = await request.post('/api/v1/auth/refresh').send({ refreshToken: 'invalid-token-123' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for missing refresh token', async () => {
      const res = await request.post('/api/v1/auth/refresh').send({});
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and invalidate refresh token', async () => {
      const res = await request.post('/api/v1/auth/logout').send({ refreshToken: validRefreshToken });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify the token is now invalid
      const refreshRes = await request.post('/api/v1/auth/refresh').send({ refreshToken: validRefreshToken });
      expect(refreshRes.status).toBe(401);
    });
  });

  describe('Protected routes', () => {
    it('should return 401 when no token provided', async () => {
      const res = await request.get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('should return 401 for expired/invalid token', async () => {
      const res = await request.get('/api/v1/admin/dashboard').set('Authorization', 'Bearer invalid-access-token');
      expect(res.status).toBe(401);
    });
  });
});
