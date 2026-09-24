import { request, createTestAdmin, getAdminToken } from './setup';

describe('Contact Messages', () => {
  let adminToken: string;
  let messageId: string;

  beforeAll(async () => {
    const admin = await createTestAdmin();
    adminToken = await getAdminToken(admin.email, 'TestPassword@123');
  });

  describe('POST /api/v1/contact', () => {
    it('should submit a contact message successfully', async () => {
      const res = await request.post('/api/v1/contact').send({
        name: 'Test User',
        email: 'test@contact.com',
        subject: 'Inquiry',
        message: 'This is a test message for the contact form.',
      });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      
      messageId = res.body.data.id;
    });

    it('should return 422 for missing required fields', async () => {
      const res = await request.post('/api/v1/contact').send({
        email: 'test@contact.com',
        message: 'No name or subject provided',
      });
      expect(res.status).toBe(422);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request.post('/api/v1/contact').send({
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Inquiry',
        message: 'This is a test message for the contact form.',
      });
      expect(res.status).toBe(422);
    });
  });

  describe('Admin Contact Messages Management', () => {
    it('should list all contact messages for admin', async () => {
      const res = await request
        .get('/api/v1/admin/contact')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data.items).toBeInstanceOf(Array);
      
      const msg = res.body.data.items.find((m: any) => m.id === messageId);
      expect(msg).toBeDefined();
    });

    it('should get a single contact message', async () => {
      const res = await request
        .get(`/api/v1/admin/contact/${messageId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(messageId);
      expect(res.body.data.email).toBe('test@contact.com');
    });

    it('should update the status of a contact message', async () => {
      const res = await request
        .patch(`/api/v1/admin/contact/${messageId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'RESOLVED' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RESOLVED');
    });

    it('should return 401 for unauthorized access to list', async () => {
      const res = await request.get('/api/v1/admin/contact');
      expect(res.status).toBe(401);
    });
  });
});
