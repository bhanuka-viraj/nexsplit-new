import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: any;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = StatusCodes.OK) {
    const response: IApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, errors?: any) {
    const response: IApiResponse = {
      success: false,
      statusCode,
      message,
      data: errors, // Usually empty or specific error details
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }
  
  static created<T>(res: Response, data: T, message?: string) {
      return this.success(res, data, message, StatusCodes.CREATED);
  }
}
