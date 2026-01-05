import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';
import { User } from '../models/user.model';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated. Please login.', StatusCodes.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      const user = await User.findById(decoded.id);
      
      if (!user) {
          return next(new AppError('User not found or token invalid', StatusCodes.UNAUTHORIZED));
      }

      req.user = user;
      next();
  } catch (error) {
      return next(new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED));
  }
};
