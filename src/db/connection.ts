import { SETTINGS } from '../utils/settings';
import mongoose from 'mongoose';

class Database {
  public async connect(url?: string): Promise<boolean> {
    try {
      if (!url) {
        console.error('URL not found');
        return false;
      }
      await mongoose.connect(url, {
        dbName: SETTINGS.DB.NAME.PORTAL,
      });
      console.log('MongoDB connected');
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return true;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public async cleanDB(): Promise<void> {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('Database cleaned');
  }

  public async dropDB(): Promise<void> {
    await mongoose.connection.dropDatabase();
  }
}

export const db = new Database();

