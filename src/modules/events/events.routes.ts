import { Router } from 'express';
import { eventsController } from './events.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  listEventsQuerySchema,
  rsvpEventSchema,
} from './events.validator';

const publicEventsRouter = Router();
const adminEventsRouter = Router();

// ==========================================
// Public & Direct Routes: /api/events & /api/v1/events
// ==========================================

// GET /api/events (Public list)
publicEventsRouter.get('/', validate(listEventsQuerySchema, 'query'), eventsController.getEvents);

// POST /api/events/:id/rsvp (Public RSVP)
publicEventsRouter.post('/:id/rsvp', validate(rsvpEventSchema), eventsController.rsvp);

// Admin-protected operations on /api/events
publicEventsRouter.post('/', authenticate, authorize('ADMIN', 'EDITOR'), validate(createEventSchema), eventsController.createEvent);
publicEventsRouter.put('/:id', authenticate, authorize('ADMIN', 'EDITOR'), validate(updateEventSchema), eventsController.updateEvent);
publicEventsRouter.patch('/:id', authenticate, authorize('ADMIN', 'EDITOR'), validate(updateEventSchema), eventsController.updateEvent);
publicEventsRouter.delete('/:id', authenticate, authorize('ADMIN', 'EDITOR'), eventsController.deleteEvent);
publicEventsRouter.get('/:id/attendees', authenticate, authorize('ADMIN', 'EDITOR'), eventsController.getEventAttendees);

// GET /api/events/:idOrSlug (Public single event by ID or slug - placed after specific subroutes)
publicEventsRouter.get('/:idOrSlug', eventsController.getEventByIdOrSlug);

// ==========================================
// Admin Dedicated Routes: /api/admin/events & /api/v1/admin/events
// ==========================================
adminEventsRouter.use(authenticate, authorize('ADMIN', 'EDITOR'));

adminEventsRouter.get('/', validate(listEventsQuerySchema, 'query'), eventsController.getEvents);
adminEventsRouter.post('/', validate(createEventSchema), eventsController.createEvent);
adminEventsRouter.get('/:id/attendees', eventsController.getEventAttendees);
adminEventsRouter.get('/:idOrSlug', eventsController.getEventByIdOrSlug);
adminEventsRouter.put('/:id', validate(updateEventSchema), eventsController.updateEvent);
adminEventsRouter.patch('/:id', validate(updateEventSchema), eventsController.updateEvent);
adminEventsRouter.patch('/:id/status', validate(updateEventStatusSchema), eventsController.updateEventStatus);
adminEventsRouter.delete('/:id', eventsController.deleteEvent);

export { publicEventsRouter, adminEventsRouter };
