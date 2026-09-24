import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import supertest from 'supertest';
import app from '../src/app';

export const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL } },
});

export const request = supertest(app);

export const createTestAdmin = async () => {
  const passwordHash = await bcrypt.hash('TestPassword@123', 12);
  return prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'Admin',
      email: `admin-${Date.now()}@test.com`,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
};

export const getAdminToken = async (email: string, password: string): Promise<string> => {
  const res = await request.post('/api/v1/auth/login').send({ email, password });
  return res.body.data?.accessToken;
};

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  // Clean test data in correct order
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.post.deleteMany();
  await prisma.media.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } });
  await prisma.$disconnect();
});
