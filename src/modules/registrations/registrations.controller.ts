import { Request, Response, NextFunction } from 'express';
import { RegistrationsService } from './registrations.service';
import { successResponse } from '../../utils/response';

export class RegistrationsController {
  private service = new RegistrationsService();

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      successResponse(res, result, 'Registration created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getMemberCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getMemberCount();
      successResponse(res, result, 'Member count retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getAllRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { registrations, pagination } = await this.service.getAllRegistrations(req.query as any);
      successResponse(res, registrations, 'Registrations retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  };

  getRegistrationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await this.service.getRegistrationById(id);
      successResponse(res, result, 'Registration retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  };
}
