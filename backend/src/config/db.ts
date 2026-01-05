import mongoose from 'mongoose';
import { env } from './env';
import { Logger } from './logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    Logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
