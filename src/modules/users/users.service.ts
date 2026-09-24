import * as usersRepository from './users.repository';
import { NotFoundError } from '../../types/errors';

export const findByEmail = async (email: string) => {
  return usersRepository.findByEmail(email);
};

export const findById = async (id: string) => {
  return usersRepository.findById(id);
};

export const getUserProfile = async (id: string) => {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};
