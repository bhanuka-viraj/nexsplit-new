import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from '../models/transaction.model';

import { ApiResponse } from '../utils/ApiResponse';

export const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    
    // Recent activity
    const recentTransactions = await Transaction.find({ 
        $or: [{ paidByUserId: userId }, { 'splitDetails.userId': userId }] 
    })
    .sort({ date: -1 })
    .limit(5)
    .populate('paidByUserId', 'name');

    // Calculate total balance? (Expensive without cache, skipping for now)
    
    ApiResponse.success(res, {
        recentTransactions,
        monthlyLimit: (req.user as any).monthlyLimit,
        currentSpend: 0 // Placeholder
    });
});
