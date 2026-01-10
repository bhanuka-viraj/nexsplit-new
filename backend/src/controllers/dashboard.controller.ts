import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { Transaction as TransactionModel } from '../models/transaction.model';
import { CalculationService } from '../services/calculation.service';

export const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const user = req.user as any;

    // Use CalculationService for all calculations
    const balance = await CalculationService.calculateUserBalance(userId);
    const monthlySpend = await CalculationService.calculateMonthlySpend(userId, user.monthlyLimit || 2000);
    
    // Get recent transactions
    const recentTransactions = await TransactionModel.find({
        $or: [
            { paidByUserId: userId },
            { 'splitDetails.userId': userId }
        ]
    })
    .sort({ date: -1 })
    .limit(5)
    .populate('paidByUserId', 'name avatarUrl')
    .populate('groupId', 'name');

    ApiResponse.success(res, {
        balance,
        monthlySpend,
        recentTransactions,
        // Include user preferences
        userPreferences: {
            currency: user.currency || 'USD',
            monthlyLimit: user.monthlyLimit || 2000
        }
    });
});

