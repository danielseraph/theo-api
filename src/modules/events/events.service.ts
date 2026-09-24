import { eventsRepository } from './events.repository';
import { NotFoundError } from '../../types/errors';
import { CreateEventInput, UpdateEventInput, ListEventsQuery, RsvpEventInput } from './events.validator';
import { buildPaginationMeta } from '../../utils/pagination';
import { generateUniqueSlug } from '../../utils/slug';
import { EventStatus } from '@prisma/client';

export class EventsService {
  async createEvent(data: CreateEventInput) {
    const slug = await generateUniqueSlug(
      data.title,
      (s) => eventsRepository.slugExists(s)
    );
    return eventsRepository.create(data, slug);
  }

  async getEvents(query: ListEventsQuery) {
    const events = await eventsRepository.findAll(query);
    const total = await eventsRepository.count(query);
    const meta = buildPaginationMeta(total, query.page || 1, query.limit || 20);
    return { events, meta };
  }

  async getEventById(id: string) {
    const event = await eventsRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found');
    return event;
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
