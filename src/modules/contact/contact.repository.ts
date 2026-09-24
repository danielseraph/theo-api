import prisma from '../../config/database';
import { Prisma, ContactStatus } from '@prisma/client';
import { ListContactMessagesQuery } from './contact.validator';

export class ContactRepository {
  async create(data: Prisma.ContactMessageCreateInput) {
    return prisma.contactMessage.create({ data });
  }

  async findById(id: string) {
    return prisma.contactMessage.findUnique({ where: { id } });
  }

  async findAll(params: ListContactMessagesQuery) {
    const { page = 1, limit = 20, status, search, sort = 'createdAt', order = 'desc' } = params;
    
    const where: Prisma.ContactMessageWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    return prisma.contactMessage.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
    });
  }

  async count(params: { status?: ContactStatus; search?: string }) {
    const where: Prisma.ContactMessageWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { subject: { contains: params.search, mode: 'insensitive' } }
      ];
    }
    return prisma.contactMessage.count({ where });
  }

  async updateStatus(id: string, status: ContactStatus) {
    return prisma.contactMessage.update({
      where: { id },
      data: { status }
    });
  }
}

export const contactRepository = new ContactRepository();
