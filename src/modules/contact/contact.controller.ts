import { Request, Response, NextFunction } from 'express';
import { contactService } from './contact.service';
import { successResponse } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';

export class ContactController {
  async submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await contactService.submitContact(req.body);
      successResponse(res, message, 'Message submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total } = await contactService.getAllMessages(req.query as any);
      
      const pagination = buildPaginationMeta(
        total,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 20
      );
      
      successResponse(res, data, 'Messages retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getMessageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const message = await contactService.getMessageById(id);
      successResponse(res, message, 'Message retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async updateMessageStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      
      const message = await contactService.updateMessageStatus(id, status);
      successResponse(res, message, 'Status updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const contactController = new ContactController();
