import { Request, Response } from 'express';
import * as TransactionService from '../services/transaction.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { Transaction as TransactionModel } from '../models/transaction.model';
import { ApiResponse } from '../utils/ApiResponse';

const splitDetailSchema = z.object({
  userId: z.string(),
  amount: z.number().min(0),
  percentage: z.number().optional(),
});

const createTransactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(['EXPENSE', 'INCOME', 'SETTLEMENT']),
  groupId: z.string().optional(),
  date: z.string().optional(),
  splitType: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE']).default('EQUAL'),
  splitDetails: z.array(splitDetailSchema).optional(),
  paidToUserId: z.string().optional(), // For settlements
});

export const createTransaction = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id.toString();
  const validation = createTransactionSchema.safeParse(req.body);
  if (!validation.success) {
     throw new AppError(validation.error.issues[0].message, StatusCodes.BAD_REQUEST);
  }

  const transaction = await TransactionService.createTransaction(userId, validation.data as any);
  ApiResponse.created(res, transaction);
});

export const getTransactions = catchAsync(async (req: Request, res: Response) => {
    // Pagination & Filtering
    const userId = (req.user as any)._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { groupId } = req.query;

    const query: any = {};
    if (groupId) query.groupId = groupId;
    
    // If no groupId, show personal + all groups I'm in?
    // For now simple global feed: Show where I am payer or in splitDetails
    if (!groupId) {
        query.$or = [
            { paidByUserId: userId },
            { 'splitDetails.userId': userId }
        ];
    }

    const transactions = await TransactionModel.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('paidByUserId', 'name avatarUrl')
        .populate('groupId', 'name'); // useful to see which group

    ApiResponse.success(res, transactions);
});

export const deleteTransaction = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transaction = await TransactionModel.findById(id); // Fixed: Use TransactionModel
    if (!transaction) throw new AppError('Transaction not found', StatusCodes.NOT_FOUND);
    
    // Check permission? Payer or Group Admin?
    if (transaction.paidByUserId.toString() !== (req.user as any)._id.toString()) {
        throw new AppError('Only the payer can delete this transaction', StatusCodes.FORBIDDEN);
    }

    await TransactionService.deleteTransaction(id);
    ApiResponse.success(res, null, 'Transaction deleted');
});

export const settleDebts = catchAsync(async (req: Request, res: Response) => {
   // Simplified Settle: User A pays User B X amount.
   // Validation handled by createSchema?
   // Only difference is type SETTLEMENT and defaults.
   
   // Reuse create logic but force type
   const userId = (req.user as any)._id.toString();
   const data = { ...req.body, type: 'SETTLEMENT', splitType: 'Exact' }; 
   // Actually settlement logic is handled by createTransaction fine if type is passed.
   // But user might want a dedicated endpoint: POST /settle { toUserId, amount, groupId }
   
   const { toUserId, amount, groupId } = req.body;
   const transaction = await TransactionService.createTransaction(userId, {
       description: 'Settlement',
       amount,
       type: 'SETTLEMENT',
       groupId, // optional
       paidByUserId: userId as any,
       paidToUserId: toUserId,
       splitType: 'EXACT',
       splitDetails: []
   } as any);

   ApiResponse.created(res, transaction);
});
