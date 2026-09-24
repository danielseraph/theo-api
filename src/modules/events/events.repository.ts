import prisma from '../../config/database';
import { Prisma, EventStatus, AttendeeStatus } from '@prisma/client';
import { CreateEventInput, UpdateEventInput, ListEventsQuery, RsvpEventInput } from './events.validator';
import { generateSlug } from '../../utils/slug';

export class EventsRepository {
  async create(data: CreateEventInput, slug: string) {
    return prisma.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        date: data.date,
        venue: data.venue,
        virtualLink: data.virtualLink,
        price: data.price,
        currency: data.currency,
        status: data.status || 'UPCOMING',
      },
    });
  }

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { attendees: true },
    });
  }

  async findAll(params: ListEventsQuery) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};
    if (params.status) where.status = params.status;

    return prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'asc' },
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

  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.event.count({ where: { slug } });
    return count > 0;
  }

  async rsvp(eventId: string, data: RsvpEventInput) {
    return prisma.eventAttendee.create({
      data: {
        eventId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ticketsCount: data.ticketsCount || 1,
        status: AttendeeStatus.REGISTERED,
      },
    });
  }
}

export const eventsRepository = new EventsRepository();
