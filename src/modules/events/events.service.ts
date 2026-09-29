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
    const page = query.page || 1;
    const limit = query.limit || 10;
    const events = await eventsRepository.findAll(query);
    const total = await eventsRepository.count(query);
    const pagination = buildPaginationMeta(total, page, limit);
    return { events, pagination };
  }

  async getEventByIdOrSlug(idOrSlug: string) {
    const event = await eventsRepository.findByIdOrSlug(idOrSlug);
    if (!event) throw new NotFoundError('Event not found');
    return event;
  }

  async getEventById(id: string) {
    const event = await eventsRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found');
    return event;
  }

  async updateEvent(id: string, data: UpdateEventInput) {
    const existing = await this.getEventById(id);

    let slug: string | undefined = undefined;
    if (data.title && data.title !== existing.title) {
      slug = await generateUniqueSlug(data.title, (s) => eventsRepository.slugExists(s, id));
    }

    return eventsRepository.update(id, { ...data, slug });
  }

  async updateEventStatus(id: string, status: EventStatus) {
    await this.getEventById(id);
    return eventsRepository.updateStatus(id, status);
  }

  async deleteEvent(id: string) {
    await this.getEventById(id);
    return eventsRepository.delete(id);
  }

  async rsvp(eventId: string, data: RsvpEventInput) {
    await this.getEventByIdOrSlug(eventId);
    return eventsRepository.rsvp(eventId, data);
  }

  async getEventAttendees(eventId: string) {
    await this.getEventByIdOrSlug(eventId);
    const attendees = await eventsRepository.getAttendees(eventId);
    const totalAttendees = await eventsRepository.countAttendees(eventId);
    return { attendees, totalAttendees };
  }
}

export const eventsService = new EventsService();
