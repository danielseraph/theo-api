import prisma from '../../config/database';
import { CreateRegistrationInput, ListRegistrationsQuery } from './registrations.validator';

const safeRegistration = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  state: true,
  country: true,
  areaOfInterest: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export class RegistrationsRepository {
  async create(data: CreateRegistrationInput & { passwordHash?: string | null }) {
    return prisma.registration.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        state: data.state || '',
        country: data.country || '',
        areaOfInterest: data.areaOfInterest || null,
        passwordHash: data.passwordHash || null,
      },
      select: safeRegistration,
    });
  }

  async findByEmail(email: string) {
    return prisma.registration.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.registration.findUnique({
      where: { id },
      select: safeRegistration,
    });
  }

  async findAll(params: ListRegistrationsQuery) {
    const { page = 1, limit = 20, search, sort = 'createdAt', order = 'desc', state, country, isActive } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (state) where.state = state;
    if (country) where.country = country;
    if (isActive !== undefined) where.isActive = isActive;

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: safeRegistration,
      }),
      prisma.registration.count({ where }),
    ]);

    return { registrations, total };
  }

  async count() {
    return prisma.registration.count();
  }

  async countByDateRange(start: Date, end: Date) {
    return prisma.registration.count({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });
  }
}
