const fs = require('fs');
const path = require('path');

const modules = {
  gallery: {
    validator: `import { z } from 'zod';
import { GalleryCategory, MediaType } from '@prisma/client';

export const createGalleryItemSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(GalleryCategory),
  mediaType: z.nativeEnum(MediaType).default('IMAGE'),
  url: z.string().url(),
  isFeatured: z.boolean().default(false).optional(),
});

export const updateGalleryItemSchema = createGalleryItemSchema.partial();

export const listGalleryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  category: z.nativeEnum(GalleryCategory).optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
export type ListGalleryQuery = z.infer<typeof listGalleryQuerySchema>;
`,
    repository: `import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { CreateGalleryItemInput, UpdateGalleryItemInput, ListGalleryQuery } from './gallery.validator';

export class GalleryRepository {
  async create(data: CreateGalleryItemInput) {
    return prisma.galleryItem.create({ data });
  }

  async findById(id: string) {
    return prisma.galleryItem.findUnique({ where: { id } });
  }

  async findAll(params: ListGalleryQuery) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GalleryItemWhereInput = {};
    if (params.category) where.category = params.category;
    if (params.mediaType) where.mediaType = params.mediaType;

    return prisma.galleryItem.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' }
    });
  }

  async count(params: ListGalleryQuery) {
    const where: Prisma.GalleryItemWhereInput = {};
    if (params.category) where.category = params.category;
    if (params.mediaType) where.mediaType = params.mediaType;
    return prisma.galleryItem.count({ where });
  }

  async update(id: string, data: UpdateGalleryItemInput) {
    return prisma.galleryItem.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.galleryItem.delete({ where: { id } });
  }
}
export const galleryRepository = new GalleryRepository();
`,
    service: `import { galleryRepository } from './gallery.repository';
import { NotFoundError } from '../../types/errors';
import { CreateGalleryItemInput, UpdateGalleryItemInput, ListGalleryQuery } from './gallery.validator';
import { buildPaginationMeta } from '../../utils/pagination';

export class GalleryService {
  async createGalleryItem(data: CreateGalleryItemInput) {
    return galleryRepository.create(data);
  }

  async getGalleryItems(query: ListGalleryQuery) {
    const items = await galleryRepository.findAll(query);
    const total = await galleryRepository.count(query);
    const meta = buildPaginationMeta(total, query.page || 1, query.limit || 20);
    return { items, meta };
  }

  async updateGalleryItem(id: string, data: UpdateGalleryItemInput) {
    const item = await galleryRepository.findById(id);
    if (!item) throw new NotFoundError('Gallery item not found');
    return galleryRepository.update(id, data);
  }

  async deleteGalleryItem(id: string) {
    const item = await galleryRepository.findById(id);
    if (!item) throw new NotFoundError('Gallery item not found');
    return galleryRepository.delete(id);
  }
}
export const galleryService = new GalleryService();
`,
    controller: `import { Request, Response, NextFunction } from 'express';
import { galleryService } from './gallery.service';
import { successResponse } from '../../utils/response';

export class GalleryController {
  async getGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, meta } = await galleryService.getGalleryItems(req.query as any);
      successResponse(res, items, 'Gallery items retrieved successfully', 200, meta);
    } catch (error) { next(error); }
  }

  async createGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await galleryService.createGalleryItem(req.body);
      successResponse(res, item, 'Gallery item created successfully', 201);
    } catch (error) { next(error); }
  }

  async updateGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await galleryService.updateGalleryItem(req.params.id, req.body);
      successResponse(res, item, 'Gallery item updated successfully');
    } catch (error) { next(error); }
  }

  async deleteGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await galleryService.deleteGalleryItem(req.params.id);
      successResponse(res, null, 'Gallery item deleted successfully');
    } catch (error) { next(error); }
  }
}
export const galleryController = new GalleryController();
`,
    routes: `import { Router } from 'express';
import { galleryController } from './gallery.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';
import { createGalleryItemSchema, updateGalleryItemSchema, listGalleryQuerySchema } from './gallery.validator';

const publicGalleryRouter = Router();
const adminGalleryRouter = Router();

publicGalleryRouter.get('/', validate(listGalleryQuerySchema, 'query'), galleryController.getGallery);

adminGalleryRouter.use(authenticate, authorize(Role.ADMIN));
adminGalleryRouter.post('/', validate(createGalleryItemSchema, 'body'), galleryController.createGalleryItem);
adminGalleryRouter.patch('/:id', validate(updateGalleryItemSchema, 'body'), galleryController.updateGalleryItem);
adminGalleryRouter.delete('/:id', galleryController.deleteGalleryItem);

export { publicGalleryRouter, adminGalleryRouter };
`
  },
  events: {
    validator: `import { z } from 'zod';
import { EventStatus } from '@prisma/client';

export const createEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  date: z.coerce.date(),
  venue: z.string().optional().nullable(),
  virtualLink: z.string().url().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().default('USD').optional(),
  status: z.nativeEnum(EventStatus).default('UPCOMING'),
});

export const updateEventSchema = createEventSchema.partial();

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  status: z.nativeEnum(EventStatus).optional(),
});

export const rsvpEventSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  ticketsCount: z.number().min(1).default(1).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type RsvpEventInput = z.infer<typeof rsvpEventSchema>;
`,
    repository: `import prisma from '../../config/database';
import { Prisma, EventStatus, AttendeeStatus } from '@prisma/client';
import { CreateEventInput, UpdateEventInput, ListEventsQuery, RsvpEventInput } from './events.validator';
import { generateUniqueSlug } from '../../utils/slug';

export class EventsRepository {
  async create(data: CreateEventInput) {
    const slug = await generateUniqueSlug(data.title, 'event');
    return prisma.event.create({
      data: {
        ...data,
        slug,
      }
    });
  }

  async findById(id: string) {
    return prisma.event.findUnique({ where: { id } });
  }

  async findAll(params: ListEventsQuery) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};
    if (params.status) where.status = params.status;

    return prisma.event.findMany({
      where, skip, take: limit, orderBy: { date: 'asc' }
    });
  }

  async count(params: ListEventsQuery) {
    const where: Prisma.EventWhereInput = {};
    if (params.status) where.status = params.status;
    return prisma.event.count({ where });
  }

  async update(id: string, data: UpdateEventInput) {
    return prisma.event.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: EventStatus) {
    return prisma.event.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    return prisma.event.delete({ where: { id } });
  }

  async rsvp(eventId: string, data: RsvpEventInput) {
    return prisma.eventAttendee.create({
      data: {
        eventId,
        ...data,
        status: AttendeeStatus.REGISTERED
      }
    });
  }
}
export const eventsRepository = new EventsRepository();
`,
    service: `import { eventsRepository } from './events.repository';
import { NotFoundError } from '../../types/errors';
import { CreateEventInput, UpdateEventInput, ListEventsQuery, RsvpEventInput } from './events.validator';
import { buildPaginationMeta } from '../../utils/pagination';
import { EventStatus } from '@prisma/client';

export class EventsService {
  async createEvent(data: CreateEventInput) {
    return eventsRepository.create(data);
  }

  async getEvents(query: ListEventsQuery) {
    const events = await eventsRepository.findAll(query);
    const total = await eventsRepository.count(query);
    const meta = buildPaginationMeta(total, query.page || 1, query.limit || 20);
    return { events, meta };
  }

  async updateEvent(id: string, data: UpdateEventInput) {
    const event = await eventsRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found');
    return eventsRepository.update(id, data);
  }

  async updateEventStatus(id: string, status: EventStatus) {
    const event = await eventsRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found');
    return eventsRepository.updateStatus(id, status);
  }

  async deleteEvent(id: string) {
    const event = await eventsRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found');
    return eventsRepository.delete(id);
  }

  async rsvp(eventId: string, data: RsvpEventInput) {
    const event = await eventsRepository.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');
    return eventsRepository.rsvp(eventId, data);
  }
}
export const eventsService = new EventsService();
`,
    controller: `import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';
import { successResponse } from '../../utils/response';

export class EventsController {
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { events, meta } = await eventsService.getEvents(req.query as any);
      successResponse(res, events, 'Events retrieved successfully', 200, meta);
    } catch (error) { next(error); }
  }

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await eventsService.createEvent(req.body);
      successResponse(res, event, 'Event created successfully', 201);
    } catch (error) { next(error); }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await eventsService.updateEvent(req.params.id, req.body);
      successResponse(res, event, 'Event updated successfully');
    } catch (error) { next(error); }
  }

  async updateEventStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await eventsService.updateEventStatus(req.params.id, req.body.status);
      successResponse(res, event, 'Event status updated successfully');
    } catch (error) { next(error); }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await eventsService.deleteEvent(req.params.id);
      successResponse(res, null, 'Event deleted successfully');
    } catch (error) { next(error); }
  }

  async rsvp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attendee = await eventsService.rsvp(req.params.id, req.body);
      successResponse(res, attendee, 'RSVP successful', 201);
    } catch (error) { next(error); }
  }
}
export const eventsController = new EventsController();
`,
    routes: `import { Router } from 'express';
import { eventsController } from './events.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';
import { createEventSchema, updateEventSchema, listEventsQuerySchema, rsvpEventSchema } from './events.validator';
import { z } from 'zod';

const publicEventsRouter = Router();
const adminEventsRouter = Router();

publicEventsRouter.get('/', validate(listEventsQuerySchema, 'query'), eventsController.getEvents);
publicEventsRouter.post('/:id/rsvp', validate(rsvpEventSchema, 'body'), eventsController.rsvp);

adminEventsRouter.use(authenticate, authorize(Role.ADMIN));
adminEventsRouter.post('/', validate(createEventSchema, 'body'), eventsController.createEvent);
adminEventsRouter.put('/:id', validate(updateEventSchema, 'body'), eventsController.updateEvent);
adminEventsRouter.patch('/:id/status', validate(z.object({ status: z.string() }), 'body'), eventsController.updateEventStatus);
adminEventsRouter.delete('/:id', eventsController.deleteEvent);

export { publicEventsRouter, adminEventsRouter };
`
  },
  leadership: {
    validator: `import { z } from 'zod';
import { LeadershipCategory } from '@prisma/client';

export const createLeadershipSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  bio: z.string().optional().nullable(),
  category: z.nativeEnum(LeadershipCategory),
  photoUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().default(0).optional(),
});

export const updateLeadershipSchema = createLeadershipSchema.partial();

export const reorderLeadershipSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int(),
    })
  )
});

export type CreateLeadershipInput = z.infer<typeof createLeadershipSchema>;
export type UpdateLeadershipInput = z.infer<typeof updateLeadershipSchema>;
export type ReorderLeadershipInput = z.infer<typeof reorderLeadershipSchema>;
`,
    repository: `import prisma from '../../config/database';
import { CreateLeadershipInput, UpdateLeadershipInput, ReorderLeadershipInput } from './leadership.validator';

export class LeadershipRepository {
  async create(data: CreateLeadershipInput) {
    return prisma.leadershipMember.create({ data });
  }

  async findById(id: string) {
    return prisma.leadershipMember.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.leadershipMember.findMany({
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' }
      ]
    });
  }

  async update(id: string, data: UpdateLeadershipInput) {
    return prisma.leadershipMember.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.leadershipMember.delete({ where: { id } });
  }

  async reorder(data: ReorderLeadershipInput) {
    return prisma.$transaction(
      data.items.map(item => 
        prisma.leadershipMember.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder }
        })
      )
    );
  }
}
export const leadershipRepository = new LeadershipRepository();
`,
    service: `import { leadershipRepository } from './leadership.repository';
import { NotFoundError } from '../../types/errors';
import { CreateLeadershipInput, UpdateLeadershipInput, ReorderLeadershipInput } from './leadership.validator';

export class LeadershipService {
  async createMember(data: CreateLeadershipInput) {
    return leadershipRepository.create(data);
  }

  async getMembers() {
    return leadershipRepository.findAll();
  }

  async updateMember(id: string, data: UpdateLeadershipInput) {
    const member = await leadershipRepository.findById(id);
    if (!member) throw new NotFoundError('Team member not found');
    return leadershipRepository.update(id, data);
  }

  async deleteMember(id: string) {
    const member = await leadershipRepository.findById(id);
    if (!member) throw new NotFoundError('Team member not found');
    return leadershipRepository.delete(id);
  }

  async reorderMembers(data: ReorderLeadershipInput) {
    return leadershipRepository.reorder(data);
  }
}
export const leadershipService = new LeadershipService();
`,
    controller: `import { Request, Response, NextFunction } from 'express';
import { leadershipService } from './leadership.service';
import { successResponse } from '../../utils/response';

export class LeadershipController {
  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await leadershipService.getMembers();
      successResponse(res, members, 'Leadership members retrieved successfully');
    } catch (error) { next(error); }
  }

  async createMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await leadershipService.createMember(req.body);
      successResponse(res, member, 'Leadership member created successfully', 201);
    } catch (error) { next(error); }
  }

  async updateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await leadershipService.updateMember(req.params.id, req.body);
      successResponse(res, member, 'Leadership member updated successfully');
    } catch (error) { next(error); }
  }

  async deleteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await leadershipService.deleteMember(req.params.id);
      successResponse(res, null, 'Leadership member deleted successfully');
    } catch (error) { next(error); }
  }

  async reorderMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await leadershipService.reorderMembers(req.body);
      successResponse(res, null, 'Leadership members reordered successfully');
    } catch (error) { next(error); }
  }
}
export const leadershipController = new LeadershipController();
`,
    routes: `import { Router } from 'express';
import { leadershipController } from './leadership.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';
import { createLeadershipSchema, updateLeadershipSchema, reorderLeadershipSchema } from './leadership.validator';

const publicLeadershipRouter = Router();
const adminLeadershipRouter = Router();

publicLeadershipRouter.get('/', leadershipController.getMembers);

adminLeadershipRouter.use(authenticate, authorize(Role.ADMIN));
adminLeadershipRouter.post('/', validate(createLeadershipSchema, 'body'), leadershipController.createMember);
adminLeadershipRouter.put('/:id', validate(updateLeadershipSchema, 'body'), leadershipController.updateMember);
adminLeadershipRouter.patch('/reorder', validate(reorderLeadershipSchema, 'body'), leadershipController.reorderMembers);
adminLeadershipRouter.delete('/:id', leadershipController.deleteMember);

export { publicLeadershipRouter, adminLeadershipRouter };
`
  }
};

const baseDir = path.join('c:', 'Users', 'ADMIN', 'Projects', 'Dr Theos', 'backend', 'src', 'modules');

Object.keys(modules).forEach(modName => {
  const modPath = path.join(baseDir, modName);
  if (!fs.existsSync(modPath)) fs.mkdirSync(modPath, { recursive: true });
  
  Object.keys(modules[modName]).forEach(fileType => {
    const filePath = path.join(modPath, \`\${modName}.\${fileType}.ts\`);
    fs.writeFileSync(filePath, modules[modName][fileType]);
    console.log(\`Created \${filePath}\`);
  });
});
