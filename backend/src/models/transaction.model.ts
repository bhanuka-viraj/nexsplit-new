import mongoose, { Schema, Document } from 'mongoose';

export interface ISplitDetail {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  percentage?: number;
}

export interface ITransaction extends Document {
  description: string;
  amount: number;
  date: Date;
  type: 'EXPENSE' | 'INCOME' | 'SETTLEMENT';
  groupId?: mongoose.Schema.Types.ObjectId;
  paidByUserId: mongoose.Schema.Types.ObjectId;
  paidToUserId?: mongoose.Schema.Types.ObjectId;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  splitDetails: ISplitDetail[];
  category?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SplitDetailSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number },
});

const TransactionSchema: Schema = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['EXPENSE', 'INCOME', 'SETTLEMENT'],
      required: true,
    },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    paidByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paidToUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // For Settlements
    splitType: {
      type: String,
      enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
      default: 'EQUAL',
    },
    splitDetails: [SplitDetailSchema],
    category: { type: String },
    receiptUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
