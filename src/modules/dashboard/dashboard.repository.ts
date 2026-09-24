import prisma from '../../config/database';

export class DashboardRepository {
  async totalRegistrations(): Promise<number> {
    return prisma.registration.count();
  }
  
  async registrationsToday(): Promise<number> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return prisma.registration.count({
      where: { createdAt: { gte: today } }
    });
  }
  
  async registrationsThisWeek(): Promise<number> {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const diff = now.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
    const monday = new Date(now.setUTCDate(diff));
    monday.setUTCHours(0, 0, 0, 0);
    return prisma.registration.count({
      where: { createdAt: { gte: monday } }
    });
  }
  
  async registrationsThisMonth(): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return prisma.registration.count({
      where: { createdAt: { gte: firstDayOfMonth } }
    });
  }
  
  async totalPosts(): Promise<number> {
    return prisma.post.count();
  }
  
  async publishedPosts(): Promise<number> {
    return prisma.post.count({
      where: { status: 'PUBLISHED' }
    });
  }
}
