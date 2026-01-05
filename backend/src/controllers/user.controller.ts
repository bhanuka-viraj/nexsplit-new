import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

import { ApiResponse } from '../utils/ApiResponse';

export const getMe = (req: Request, res: Response) => {
  ApiResponse.success(res, req.user);
};

export const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return ApiResponse.success(res, []);
  }

  // Case-insensitive search by name or email, excluding current user
  const currentUserId = (req.user as any)._id;
  const users = await User.find({
    $and: [
      { _id: { $ne: currentUserId } },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      },
    ],
  })
    .select('id name email avatarUrl')
    .limit(10);

  ApiResponse.success(res, users);
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('id name avatarUrl createdAt');

  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }

  ApiResponse.success(res, user);
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { name, avatarUrl, monthlyLimit, currency } = req.body;
    
    // Whitelist update fields
    const updatedUser = await User.findByIdAndUpdate(userId, { name, avatarUrl, monthlyLimit, currency }, { new: true });
    
    ApiResponse.success(res, updatedUser);
});

export const getUserStats = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    // Simple total spent calculation would go here.
    // For MVP, just return mock or basic aggregation
    ApiResponse.success(res, { totalSpent: 0, totalSaved: 0 });
});
