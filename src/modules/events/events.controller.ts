import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';
import { successResponse } from '../../utils/response';

export class EventsController {
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { events, meta } = await eventsService.getEvents(req.query as any);
      successResponse(res, events, 'Events retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await eventsService.createEvent(req.body);
      successResponse(res, event, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await eventsService.updateEvent(id, req.body);
      successResponse(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateEventStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await eventsService.updateEventStatus(id, req.body.status);
      successResponse(res, event, 'Event status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await eventsService.deleteEvent(id);
      successResponse(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async rsvp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const attendee = await eventsService.rsvp(id, req.body);
      successResponse(res, attendee, 'RSVP successful', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const eventsController = new EventsController();
