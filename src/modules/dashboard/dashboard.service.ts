import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  private repository = new DashboardRepository();

  async getStats() {
    const [
      totalRegistered, 
      registeredToday, 
      registeredThisWeek, 
      registeredThisMonth, 
      totalPosts, 
      publishedPosts
    ] = await Promise.all([
      this.repository.totalRegistrations(),
      this.repository.registrationsToday(),
      this.repository.registrationsThisWeek(),
      this.repository.registrationsThisMonth(),
      this.repository.totalPosts(),
      this.repository.publishedPosts()
    ]);

    return { 
      totalRegistered, 
      registeredToday, 
      registeredThisWeek, 
      registeredThisMonth, 
      totalPosts, 
      publishedPosts 
    };
  }
}
