import { LeadershipMember, Prisma } from '@prisma/client';
import prisma from '../../config/database';

export class LeadershipRepository {
  async findAll(): Promise<LeadershipMember[]> {
    return prisma.leadershipMember.findMany({
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
      ],
    });
  }

  async findById(id: string): Promise<LeadershipMember | null> {
    return prisma.leadershipMember.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.LeadershipMemberCreateInput): Promise<LeadershipMember> {
    return prisma.leadershipMember.create({
      data,
    });
  }

  async update(id: string, data: Prisma.LeadershipMemberUpdateInput): Promise<LeadershipMember> {
    return prisma.leadershipMember.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<LeadershipMember> {
    return prisma.leadershipMember.delete({
      where: { id },
    });
  }

  async updateMany(updates: { id: string; displayOrder: number }[]): Promise<void> {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.leadershipMember.update({
          where: { id: update.id },
          data: { displayOrder: update.displayOrder },
        })
      )
    );
  }
}
