import mongoose from 'mongoose';
import { Group, IGroup } from '../models/group.model';
import { Transaction } from '../models/transaction.model';

export const findAllUserGroups = async (userId: string) => {
  // Aggregate to get groups with totalCost
  // Option 1: Fetch groups then aggregate transactions (Simplest for now)
  const groups = await Group.find({ members: userId })
    .populate('members', 'id name avatarUrl')
    .sort({ updatedAt: -1 });

  // For each group, calculate total cost (this could be optimized with a strict aggregation pipeline later)
  const groupsWithTotal = await Promise.all(
    groups.map(async (group) => {
      const result = await Transaction.aggregate([
        { $match: { groupId: group._id, type: 'EXPENSE' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const totalCost = result[0]?.total || 0;
      return { ...group.toObject(), totalCost };
    })
  );

  return groupsWithTotal;
};

export const createGroup = async (userId: string, data: Partial<IGroup>) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const group = await Group.create([{ ...data, creatorId: userId, members: [userId, ...(data.members || [])] }], { session });
    
    // If we wanted to add initial activity logs, we would do it here using the session
    
    await session.commitTransaction();
    return group[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


export const findGroupById = async (groupId: string) => {
  return await Group.findById(groupId).populate('members', 'id name avatarUrl');
};

export const updateGroup = async (groupId: string, data: Partial<IGroup>) => {
  return await Group.findByIdAndUpdate(groupId, data, { new: true });
};

export const removeMember = async (groupId: string, userId: string) => {
    // Check if group has only 1 member?
    return await Group.findByIdAndUpdate(groupId, { $pull: { members: userId, admins: userId } }, { new: true });
};

