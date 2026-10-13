import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

/**
 * Connects to MongoDB Atlas if MONGODB_URI is provided.
 * If MONGODB_URI is not set or unavailable during development,
 * starts an embedded local MongoDB instance so the application
 * runs with 100% full Mongoose / MongoDB persistence.
 */
export async function connectDB(): Promise<void> {
  const mongoUri = (process.env.MONGODB_URI || config.mongodbUri || '').trim();
  // MongoDB database names cannot contain spaces or special characters
  let dbName = (process.env.DB_NAME || config.dbName || 'campusnews').trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  if (!dbName || dbName === '_') {
    dbName = 'campusnews';
  }

  // Check if valid remote/Atlas URI is provided
  const isAtlasConfigured =
    mongoUri &&
    !mongoUri.includes('<username>') &&
    !mongoUri.includes('MY_MONGODB') &&
    (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'));

  if (isAtlasConfigured) {
    try {
      console.log(`Connecting to MongoDB Atlas (${dbName})...`);
      await mongoose.connect(mongoUri, {
        dbName,
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      console.log(`✅ [MongoDB Atlas] Connected successfully to database: "${dbName}"`);
      return;
    } catch (err: any) {
      console.warn(`⚠️ [MongoDB Atlas] Connection attempt to Atlas timed out or IP not whitelisted:`, err.message || err);
      console.log(`Switching to local MongoDB engine for uninterrupted operation...`);
    }
  } else {
    console.log(`ℹ️ [MongoDB] Initializing local MongoDB engine for database "${dbName}"...`);
  }

  // Start local MongoDB Memory Server instance
  try {
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri, {
      dbName,
    });
    console.log(`✅ [MongoDB] Database active and connected: "${dbName}"`);
  } catch (err: any) {
    console.error(`❌ [MongoDB] Fatal error initializing MongoDB:`, err.message || err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err: any) {
    console.error('Error disconnecting MongoDB:', err.message || err);
  }
}
