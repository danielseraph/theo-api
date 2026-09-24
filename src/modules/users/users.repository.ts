import prisma from '../../config/database';
import { PaginationParams } from '../../types';

export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (user) {
    return safeUser(user);
  }
  return null;
};

export const findAll = async (params: PaginationParams) => {
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    skip,
    take: limit,
  });

  return users.map(safeUser);
};

export const count = async () => {
  return prisma.user.count();
};

export const safeUser = (user: any) => {
  const { passwordHash, ...safe } = user;
  return safe;
};
