import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  type: 'INVITE' | 'EXPENSE_ADDED' | 'SETTLEMENT' | 'MENTION';
  title: string;
  message?: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['INVITE', 'EXPENSE_ADDED', 'SETTLEMENT', 'MENTION'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
