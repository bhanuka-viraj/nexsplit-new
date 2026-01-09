import mongoose from 'mongoose';
import { env } from './env';
import { Logger } from './logger';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    isConnected = !!conn.connections[0].readyState;
    Logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    Logger.error(`Error: ${(error as Error).message}`);
    if (env.NODE_ENV === 'development') {
      process.exit(1);
    }
    throw error;
  }
};
