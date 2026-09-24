import { Request, Response, NextFunction } from 'express';
import { LeadershipService } from './leadership.service';
import { successResponse } from '../../utils/response';

export class LeadershipController {
  private service: LeadershipService;

  constructor() {
    this.service = new LeadershipService();
  }

  getMembers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const members = await this.service.getAllMembers();
      successResponse(res, members, 'Leadership members retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const member = await this.service.createMember(req.body);
      successResponse(res, member, 'Leadership member created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const member = await this.service.updateMember(id, req.body);
      successResponse(res, member, 'Leadership member updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.deleteMember(id);
      successResponse(res, null, 'Leadership member deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  reorderMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.reorderMembers(req.body);
      successResponse(res, null, 'Leadership members reordered successfully');
    } catch (error) {
      next(error);
    }
  };
}
