import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { AuthenticationError } from '../types/errors';

export const signAccessToken = (payload: Omit<JwtPayload, 'type'>): string =>
  jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const signRefreshToken = (payload: Omit<JwtPayload, 'type'>): string =>
  jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw new AuthenticationError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};

export const getRefreshTokenExpiry = (): Date => {
  const val = env.JWT_REFRESH_EXPIRES_IN;
  const num = parseInt(val, 10);
  const unit = val.slice(-1);
  const ms =
    unit === 'd'
      ? num * 86_400_000
      : unit === 'h'
      ? num * 3_600_000
      : unit === 'm'
      ? num * 60_000
      : num * 1_000;
  return new Date(Date.now() + ms);
};
