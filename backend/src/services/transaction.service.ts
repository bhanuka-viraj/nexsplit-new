import mongoose from 'mongoose';
import { Transaction, ITransaction } from '../models/transaction.model';
import { AppError } from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

const TOLERANCE = 0.02; // 2 cents tolerance for matching sums

export const createTransaction = async (userId: string, data: Partial<ITransaction>) => {
  const { amount, splitDetails, splitType, type } = data;

  // Validation: Check splits
  if (type === 'EXPENSE' && splitDetails && splitDetails.length > 0) {
      let totalSplit = 0;
      if (splitType === 'EXACT') {
          totalSplit = splitDetails.reduce((acc, curr) => acc + curr.amount, 0);
      } else if (splitType === 'PERCENTAGE') {
          const totalPercent = splitDetails.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
           if (Math.abs(totalPercent - 100) > TOLERANCE) {
              throw new AppError(`Percentages must equal 100% (got ${totalPercent}%)`, StatusCodes.BAD_REQUEST);
           }
           totalSplit = amount!; // Implicitly matches
      } else {
          // EQUAL
          totalSplit = amount!;
      }

      if (splitType === 'EXACT' && Math.abs(totalSplit - amount!) > TOLERANCE) {
          throw new AppError(`Split amounts (${totalSplit}) do not equal total amount (${amount})`, StatusCodes.BAD_REQUEST);
      }
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
      const transaction = await Transaction.create([{
          ...data,
          paidByUserId: userId 
      }], { session });

      await session.commitTransaction();
      return transaction[0];
  } catch (error) {
      await session.abortTransaction();
      throw error;
  } finally {
      session.endSession();
  }
};

export const deleteTransaction = async (transactionId: string) => {
    return await Transaction.findByIdAndDelete(transactionId);
};
