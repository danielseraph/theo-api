import { LeadershipMember, Prisma } from '@prisma/client';
import { LeadershipRepository } from './leadership.repository';
import { NotFoundError, ConflictError } from '../../types/errors';

export class LeadershipService {
  private repository: LeadershipRepository;

  constructor() {
    this.repository = new LeadershipRepository();
  }

  async getAllMembers(): Promise<LeadershipMember[]> {
    return this.repository.findAll();
  }

  async getMemberById(id: string): Promise<LeadershipMember> {
    const member = await this.repository.findById(id);
    if (!member) {
      throw new NotFoundError('Leadership member not found');
    }
    return member;
  }

  async createMember(data: Prisma.LeadershipMemberCreateInput): Promise<LeadershipMember> {
    if (data.id) {
      const existing = await this.repository.findById(data.id);
      if (existing) {
        throw new ConflictError(`Leadership member with id ${data.id} already exists`);
      }
    }
    return this.repository.create(data);
  }

  async updateMember(id: string, data: Prisma.LeadershipMemberUpdateInput): Promise<LeadershipMember> {
    await this.getMemberById(id);
    return this.repository.update(id, data);
  }

  async deleteMember(id: string): Promise<LeadershipMember> {
    await this.getMemberById(id);
    return this.repository.delete(id);
  }

  async reorderMembers(updates: { id: string; displayOrder: number }[]): Promise<void> {
    await this.repository.updateMany(updates);
  }
}
