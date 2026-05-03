import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<boolean> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

export const isDBConnected = () => mongoose.connection.readyState === 1;
