import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { CalculationService } from '../services/calculation.service';
import { Types } from 'mongoose';

export const getDebts = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    
    // Calculate settlements across all groups
    const allSettlements = await CalculationService.calculateSettlements(userId, undefined, 'simplified');
    
    // Filter to only include debts where current user owes money
    const userDebts = allSettlements.filter(s => s.from.userId === userId.toString());
    
    // Calculate total owing
    const totalOwing = userDebts.reduce((sum, s) => sum + s.amount, 0);
    
    ApiResponse.success(res, {
        totalOwing: Math.round(totalOwing * 100) / 100,
        settlements: userDebts  // Only return user's debts
    });
});

export const getSettlements = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { strategy = 'simplified', groupId } = req.query;
    
    const groupObjectId = groupId ? new Types.ObjectId(groupId as string) : undefined;
    const settlements = await CalculationService.calculateSettlements(
        userId,
        groupObjectId,
        strategy as 'simplified' | 'detailed'
    );
    
    ApiResponse.success(res, {
        strategy,
        settlements,
        totalSettlements: settlements.length,
        totalAmount: settlements.reduce((sum, s) => sum + s.amount, 0)
    });
});
