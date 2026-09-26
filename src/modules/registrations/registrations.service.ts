import { RegistrationsRepository } from './registrations.repository';
import { CreateRegistrationInput, ListRegistrationsQuery } from './registrations.validator';
import { ConflictError, NotFoundError } from '../../types/errors';
import bcrypt from 'bcryptjs';
import { buildPaginationMeta } from '../../utils/pagination';

export class RegistrationsService {
  private repository = new RegistrationsRepository();

  async register(input: CreateRegistrationInput) {
    const existingUser = await this.repository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('This email is already registered.');
    }

    // Only hash password if one was provided (passwordless flow leaves it null)
    let passwordHash: string | null = null;
    if (input.password) {
      passwordHash = await bcrypt.hash(input.password, 12);
    }

    return this.repository.create({ ...input, passwordHash });
  }

  async getMemberCount() {
    const total = await this.repository.count();
    return { total };
  }

  async getAllRegistrations(query: ListRegistrationsQuery) {
    const { page = 1, limit = 20 } = query;
    const { registrations, total } = await this.repository.findAll(query);
    
    const pagination = buildPaginationMeta(total, page, limit);

    return { registrations, pagination };
  }

  async getRegistrationById(id: string) {
    const registration = await this.repository.findById(id);
    if (!registration) {
      throw new NotFoundError('Registration not found');
    }
    return registration;
  }
}
