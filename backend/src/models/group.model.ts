import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  creatorId: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  admins: mongoose.Schema.Types.ObjectId[];
  currency: string;
  imageUrl?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    currency: { type: String, default: 'USD' },
    imageUrl: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>('Group', GroupSchema);
