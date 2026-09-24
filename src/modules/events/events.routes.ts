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

// Public: GET /api/v1/events
publicEventsRouter.get('/', validate(listEventsQuerySchema, 'query'), eventsController.getEvents);

// Public: POST /api/v1/events/:id/rsvp
publicEventsRouter.post('/:id/rsvp', validate(rsvpEventSchema), eventsController.rsvp);

// Admin: protected
adminEventsRouter.use(authenticate, authorize('ADMIN'));
adminEventsRouter.post('/', validate(createEventSchema), eventsController.createEvent);
adminEventsRouter.put('/:id', validate(updateEventSchema), eventsController.updateEvent);
adminEventsRouter.patch('/:id/status', validate(updateEventStatusSchema), eventsController.updateEventStatus);
adminEventsRouter.delete('/:id', eventsController.deleteEvent);

export { publicEventsRouter, adminEventsRouter };
