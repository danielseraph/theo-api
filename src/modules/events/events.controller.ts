import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';
import { successResponse } from '../../utils/response';

export class EventsController {
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { events, pagination } = await eventsService.getEvents(req.query as any);
      successResponse(res, events, 'Events retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getEventByIdOrSlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idOrSlug = (req.params.idOrSlug || req.params.id) as string;
      const event = await eventsService.getEventByIdOrSlug(idOrSlug);
      successResponse(res, event, 'Event details retrieved', 200);
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
      successResponse(res, event, 'Event updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async updateEventStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await eventsService.updateEventStatus(id, req.body.status);
      successResponse(res, event, 'Event status updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await eventsService.deleteEvent(id);
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
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

  async getEventAttendees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { attendees, totalAttendees } = await eventsService.getEventAttendees(id);
      res.status(200).json({
        success: true,
        message: 'Event attendees retrieved',
        data: attendees,
        totalAttendees,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const eventsController = new EventsController();
