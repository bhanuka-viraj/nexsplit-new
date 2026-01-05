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

export const getGroupDebts = async (groupId: string) => {
    // This requires complex aggregation of all expenses in the group
    // For now, we'll implement a simplified "net balance" view
    // A robust "minimize debt" algorithm (like Splitwise) requires graph algorithms (Max Flow)
    // Here we will return the "Net Balance" for each user in the group
    
    // 1. Get all expenses
    // 2. Calculate net flow for each user
    const pipeline = [
        { $match: { groupId: new mongoose.Types.ObjectId(groupId), type: { $in: ['EXPENSE', 'SETTLEMENT'] } } },
        { $unwind: "$splitDetails" },
        // Credit the payer
        { $group: {
            _id: "$paidByUserId",
            credit: { $sum: "$amount" } // Payer paid full amount
        }},
        // This is tricky with simple aggregation for splits.
        // Let's do it in code for now as it's more readable and easier to debug for this MVP.
    ];
    
    // Code-based approach
    const transactions = await Transaction.find({ groupId });
    const balances: Record<string, number> = {}; 

    transactions.forEach(t => {
        const payerId = t.paidByUserId.toString();
        if (!balances[payerId]) balances[payerId] = 0;
        
        if (t.type === 'SETTLEMENT' && t.paidToUserId) {
            const receiverId = t.paidToUserId.toString();
            if (!balances[receiverId]) balances[receiverId] = 0;
            // Payer gives money -> Net balance increases (technically they paid off debt, so they are "less negative")
            // Receiver gets money -> Net balance decreases (they were "owed", now they are "less positive")
            // WAIT: standard accounting:
            // I owe 10. Balance -10.
            // I pay 10. Balance 0. (+10 change)
            // Receiver was +10. Gets 10. Balance 0. (-10 change in "rights to receive")
            balances[payerId] += t.amount;
            balances[receiverId] -= t.amount;
        } else if (t.type === 'EXPENSE') {
             // Payer paid X. They are "owed" X. Balance +X.
             balances[payerId] += t.amount;
             
             // Splitters "owe" specific amounts. Balance -Y.
             t.splitDetails.forEach(split => {
                 const splitterId = split.userId.toString();
                 if (!balances[splitterId]) balances[splitterId] = 0;
                 balances[splitterId] -= split.amount;
             });
        }
    });

    return balances;
};

