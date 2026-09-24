import { request, createTestAdmin, getAdminToken } from './setup';

describe('Dashboard', () => {
  let adminToken: string;
  let initialTotalRegistered = 0;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminToken = await getAdminToken(admin.email, 'TestPassword@123');
  });

  describe('GET /api/v1/admin/dashboard', () => {
    it('should return dashboard stats', async () => {
      const res = await request.get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalRegistered');
      expect(res.body.data).toHaveProperty('registeredToday');
      expect(res.body.data).toHaveProperty('registeredThisWeek');
      expect(res.body.data).toHaveProperty('registeredThisMonth');
      expect(res.body.data).toHaveProperty('totalPosts');
      expect(typeof res.body.data.totalRegistered).toBe('number');
      
      initialTotalRegistered = res.body.data.totalRegistered;
    });

    it('should return 401 without auth', async () => {
      const res = await request.get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('registration count increases after new registration', async () => {
      // Register a new user
      await request.post('/api/v1/registrations').send({
        firstName: 'Dashboard',
        lastName: 'Test',
        email: `dashboard-${Date.now()}@test.com`,
        password: 'StrongPassword!123',
      });

      // Check dashboard again
      const res = await request.get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalRegistered).toBeGreaterThan(initialTotalRegistered);
    });
  });
});
