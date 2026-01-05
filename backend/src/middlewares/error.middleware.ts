import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Logger } from '../config/logger';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  Logger.error(err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new AppError(message, StatusCodes.NOT_FOUND);
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = `Duplicate value entered for ${Object.keys(err.keyValue)} field`;
    error = new AppError(message, StatusCodes.CONFLICT);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, StatusCodes.BAD_REQUEST);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', StatusCodes.UNAUTHORIZED);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', StatusCodes.UNAUTHORIZED);
  }

  // Send Response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
