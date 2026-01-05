import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  password?: string;
  name: string;
  avatarUrl?: string;
  monthlyLimit: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Password is optional (for Google Auth users) but not selected by default
    name: { type: String, required: true },
    avatarUrl: { type: String },
    monthlyLimit: { type: Number, default: 2000 },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
