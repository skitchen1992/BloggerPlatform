import mongoose from 'mongoose';
import { SETTINGS } from '../utils/settings';

export class Database {
  private static instance: Database;

  private constructor() {
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(url?: string): Promise<boolean> {
    try {
      if (!url) {
        console.error('URL not found');
        return false;
      }
      await mongoose.connect(url, {
        dbName: SETTINGS.DB.NAME.PORTAL,
      });
      console.log('Connected to database');
      return true;
    } catch (error) {
      console.error('Error connecting to database', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  public async dropDB(): Promise<void> {
    await mongoose.connection.dropDatabase();
  }

  public async cleanDB(): Promise<void> {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('Database cleaned');
  }

  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

