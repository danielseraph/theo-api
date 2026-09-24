import { Response } from 'express';
import { PaginationMeta } from '../types';

export const successResponse = (
  res: Response,
  data: unknown,
  message: string,
  statusCode = 200,
  pagination?: PaginationMeta
): Response => {
  const body: Record<string, unknown> = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown[]
): Response => {
  const body: Record<string, unknown> = { success: false, message };
  if (errors?.length) body.errors = errors;
  return res.status(statusCode).json(body);
};
