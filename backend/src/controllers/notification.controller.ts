import { Request, Response } from 'express';
import * as NotificationService from '../services/notification.service';
import { catchAsync } from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';

import { ApiResponse } from '../utils/ApiResponse';

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await NotificationService.getUserNotifications((req.user as any)._id.toString());
  ApiResponse.success(res, notifications);
});

export const markRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = await NotificationService.markRead((req.user as any)._id.toString(), id);
  ApiResponse.success(res, notification);
});

export const markAllRead = catchAsync(async (req: Request, res: Response) => {
    await NotificationService.markAllRead((req.user as any)._id.toString());
    ApiResponse.success(res, null, 'All marked as read');
});
