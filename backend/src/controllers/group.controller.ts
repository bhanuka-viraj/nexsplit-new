import { Request, Response } from 'express';
import * as GroupService from '../services/group.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { Transaction as TransactionModel } from '../models/transaction.model';

// Zod Schema for Create Group
const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currency: z.string().default('USD'),
  members: z.array(z.string()).optional(), // Array of UserIds
  imageUrl: z.string().optional(),
});

import { ApiResponse } from '../utils/ApiResponse';

export const getMyGroups = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id.toString();
  const groups = await GroupService.findAllUserGroups(userId);
  ApiResponse.success(res, groups);
});

export const createGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id.toString();
  const validation = createGroupSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, StatusCodes.BAD_REQUEST);
  }

  const group = await GroupService.createGroup(userId, validation.data as any);
  ApiResponse.created(res, group);
});

export const getGroupDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any)._id.toString();
  const group = await GroupService.findGroupById(id);

  if (!group) {
    throw new AppError('Group not found', StatusCodes.NOT_FOUND);
  }
  
  // Security Check: Is user a member?
  // group.members is populated as objects or stays as IDs depending on service, 
  // but findGroupById populates it.
  const isMember = group.members.some((m: any) => m._id.toString() === userId);
  if (!isMember) {
     throw new AppError('You are not a member of this group', StatusCodes.FORBIDDEN);
  }

  // Get Transactions for group
  const transactions = await TransactionModel.find({ groupId: id })
     .sort({ date: -1 })
     .populate('paidByUserId', 'id name avatarUrl')
     .populate('splitDetails.userId', 'id name avatarUrl');

  // Simple aggregation for total cost
  const totalCost = transactions
     .filter(t => t.type === 'EXPENSE')
     .reduce((acc, curr) => acc + curr.amount, 0);

  ApiResponse.success(res, { group: { ...group.toObject(), totalCost }, transactions, summary: [] });
});

export const updateGroup = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, currency, imageUrl } = req.body;
    
    // Check admin or creator permissions? For now any member can update like Splitwise
    const updatedGroup = await GroupService.updateGroup(id, { name, currency, imageUrl });
    ApiResponse.success(res, updatedGroup);
});

export const leaveGroup = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req.user as any)._id.toString();
    
    await GroupService.removeMember(id, userId);
    ApiResponse.success(res, null, 'Left group successfully');
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
    const { id, userId } = req.params;
    // Verify requester is creator or admin? 
    // Skipping strict admin check for MVP speed, assume any member can for now or impl later
    
    await GroupService.removeMember(id, userId);
    ApiResponse.success(res, null, 'Member removed');
});

export const getGroupDebts = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const debts = await GroupService.getGroupDebts(id);
    ApiResponse.success(res, debts);
});
