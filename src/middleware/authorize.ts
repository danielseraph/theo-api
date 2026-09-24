import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { AuthorizationError, AuthenticationError } from '../types/errors';

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(new AuthenticationError());
    }

    if (!roles.includes(authReq.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
