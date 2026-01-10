import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { CalculationService } from '../services/calculation.service';
import { Types } from 'mongoose';
import * as GroupService from '../services/group.service';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

export const getGroupSummary = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req.user as any)._id.toString();
    
    // Verify user is member of this group
    const group = await GroupService.findGroupById(id);
    if (!group) {
        throw new AppError('Group not found', StatusCodes.NOT_FOUND);
    }
    
    const isMember = group.members.some((m: any) => m._id.toString() === userId);
    if (!isMember) {
        throw new AppError('You are not a member of this group', StatusCodes.FORBIDDEN);
    }
    
    // Calculate summary using CalculationService
    const summary = await CalculationService.calculateGroupSummary(new Types.ObjectId(id));
    const yourPosition = summary.find(s => s.userId === userId);
    
    ApiResponse.success(res, {
        group: {
            id: group._id,
            name: group.name,
            members: group.members,
            totalExpenses: summary.reduce((sum, s) => sum + s.paid, 0)
        },
        summary,
        yourPosition
    });
});
