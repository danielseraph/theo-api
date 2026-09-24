import bcrypt from 'bcryptjs';
import * as authRepository from './auth.repository';
import * as usersService from '../users/users.service';
import { AuthenticationError } from '../../types/errors';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../../utils/jwt';
import { createAuditLog } from '../../utils/audit';

export const login = async (email: string, password: string, ipAddress?: string) => {
  const user = await usersService.findByEmail(email);
  if (!user || !user.isActive) {
    // Use same message for both cases to prevent user enumeration
    throw new AuthenticationError('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const jwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);
  const expiresAt = getRefreshTokenExpiry();

  await authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

  await createAuditLog({
    userId: user.id,
    action: 'ADMIN_LOGIN',
    ipAddress,
  });

  // Never expose passwordHash or sensitive fields
  const { passwordHash: _pw, ...safeUser } = user;

  return {
    accessToken,
    refreshToken,
    user: safeUser,
  };
};

export const refreshToken = async (token: string) => {
  const payload = verifyRefreshToken(token); // throws AuthenticationError on failure

  const tokenRecord = await authRepository.findRefreshToken(token);
  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  const user = tokenRecord.user;
  if (!user || !user.isActive) {
    throw new AuthenticationError('User is no longer active');
  }

  const jwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(jwtPayload);

  return { accessToken };
};

export const logout = async (token: string) => {
  await authRepository.deleteRefreshToken(token);
};
