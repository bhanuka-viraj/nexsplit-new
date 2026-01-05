import { Request, Response } from 'express';
import * as InvitationService from '../services/invitation.service';
import { catchAsync } from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ApiResponse } from '../utils/ApiResponse';

const inviteUserSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
});

const respondSchema = z.object({
    accept: z.boolean()
});

export const getInvitations = catchAsync(async (req: Request, res: Response) => {
  const invitations = await InvitationService.getMyPendingInvitations((req.user as any)._id.toString());
  ApiResponse.success(res, invitations);
});

export const sendInvitation = catchAsync(async (req: Request, res: Response) => {
  const validation = inviteUserSchema.safeParse(req.body);
  if (!validation.success) {
      // throw new AppError... or just use validation error
      return ApiResponse.error(res, validation.error.issues[0].message, StatusCodes.BAD_REQUEST);
  }
  const { groupId, userId } = validation.data;
  const currentUserId = (req.user as any)._id.toString();

  const invitation = await InvitationService.createInvitation(currentUserId, groupId, userId);
  ApiResponse.created(res, invitation);
});

export const respondInvitation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validation = respondSchema.safeParse(req.body);
  if (!validation.success) {
      return ApiResponse.error(res, 'Invalid body', StatusCodes.BAD_REQUEST);
  }

  const result = await InvitationService.respondToInvitation((req.user as any)._id.toString(), id, validation.data.accept);
  ApiResponse.success(res, result);
});
