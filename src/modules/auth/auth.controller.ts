import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { successResponse } from '../../utils/response';
import { LoginInput, RefreshTokenInput, LogoutInput } from './auth.validator';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;
    const ipAddress = (req.headers['x-forwarded-for'] || req.ip) as string | undefined;
    
    const result = await authService.login(email, password, ipAddress);
    
    successResponse(res, result, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshTokenInput;
    
    const result = await authService.refreshToken(refreshToken);
    
    successResponse(res, result, 'Token refreshed successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body as LogoutInput;
    
    await authService.logout(refreshToken);
    
    successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};
