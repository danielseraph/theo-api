import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { successResponse } from '../../utils/response';

export class DashboardController {
  private service = new DashboardService();

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getStats();
      successResponse(res, stats, 'Dashboard stats retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  };
}
