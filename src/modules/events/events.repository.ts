import prisma from '../../config/database';
import { Prisma, EventStatus, EventType, AttendeeStatus } from '@prisma/client';
import { CreateEventInput, UpdateEventInput, ListEventsQuery, RsvpEventInput } from './events.validator';

export const formatEvent = (event: any) => {
  if (!event) return null;
  const eventDateStr =
    event.eventDate instanceof Date
      ? event.eventDate.toISOString().split('T')[0]
      : String(event.eventDate || '');

  return {
    ...event,
    eventDate: eventDateStr,
  };
};

export const formatAttendee = (attendee: any) => ({
  id: attendee.id,
  firstName: attendee.firstName,
  lastName: attendee.lastName,
  email: attendee.email,
  phoneNumber: attendee.phoneNumber || null,
  registeredAt: attendee.createdAt,
});

export class EventsRepository {
  async create(data: CreateEventInput, slug: string) {
    const created = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        type: data.type,
        status: data.status || EventStatus.UPCOMING,
        eventDate: new Date(data.eventDate),
        time: data.time,
        location: data.location,
        seats: data.seats || null,
        isFree: data.isFree ?? true,
        fee: data.fee || null,
        coverImageUrl: data.coverImageUrl || null,
      },
    });
    return formatEvent(created);
  }

  async findByIdOrSlug(idOrSlug: string) {
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    });
    return formatEvent(event);
  }

  async findById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    return formatEvent(event);
  }

  private buildWhere(params: ListEventsQuery): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {};

    if (params.status) {
      const statusUpper = params.status.toUpperCase();
      if (statusUpper !== 'ALL') {
        if (Object.values(EventStatus).includes(statusUpper as EventStatus)) {
          where.status = statusUpper as EventStatus;
        }
      }
    } else {
      // Default: UPCOMING
      where.status = EventStatus.UPCOMING;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findAll(params: ListEventsQuery) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(params);

    const events = await prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { eventDate: 'asc' },
    });

    return events.map(formatEvent);
  }

  async count(params: ListEventsQuery) {
    const where = this.buildWhere(params);
    return prisma.event.count({ where });
  }

  async update(id: string, data: Partial<UpdateEventInput> & { slug?: string }) {
    const updateData: Prisma.EventUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.eventDate !== undefined) updateData.eventDate = new Date(data.eventDate);
    if (data.time !== undefined) updateData.time = data.time;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.seats !== undefined) updateData.seats = data.seats;
    if (data.isFree !== undefined) updateData.isFree = data.isFree;
    if (data.fee !== undefined) updateData.fee = data.fee;
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return formatEvent(updated);
  }

  async updateStatus(id: string, status: EventStatus) {
    const updated = await prisma.event.update({
      where: { id },
      data: { status },
    });
    return formatEvent(updated);
  }

  async delete(id: string) {
    return prisma.event.delete({ where: { id } });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.event.count({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async rsvp(eventId: string, data: RsvpEventInput) {
    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        ticketsCount: data.ticketsCount || 1,
        status: AttendeeStatus.REGISTERED,
      },
    });
    return formatAttendee(attendee);
  }

  async getAttendees(eventId: string) {
    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
    return attendees.map(formatAttendee);
  }

  async countAttendees(eventId: string) {
    return prisma.eventAttendee.count({ where: { eventId } });
  }
}

export const eventsRepository = new EventsRepository();
