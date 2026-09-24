import { PaginationParams, PaginationMeta } from '../types';

export const parsePaginationParams = (query: Record<string, unknown>): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10) || 20));
  const skip = (page - 1) * limit;
  const search = query.search ? String(query.search).trim() : undefined;
  const sort = query.sort ? String(query.sort) : undefined;
  const order: 'asc' | 'desc' = query.order === 'desc' ? 'desc' : 'asc';
  return { page, limit, skip, search, sort, order };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
