// ============================================================================
// ShopSphere Cached MongoDB Connection Utility (Mongoose ODM)
// Experiment 6: MongoDB & Mongoose Connection Caching for Next.js Hot Reloads
// Experiment 10: Protected with server-only
// ============================================================================
import "server-only";
import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isAvailable: boolean | null;
  lastCheckedAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
  isAvailable: null,
  lastCheckedAt: 0,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/**
 * Establishes or returns a cached Mongoose connection to MongoDB.
 * Uses a fast serverSelectionTimeoutMS (1500ms) so local development
 * responds rapidly even when MongoDB service is not running.
 */
export async function connectToMongoDB(
  forceAttempt = false
): Promise<typeof mongoose | null> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || !mongoUri.startsWith("mongodb")) {
    cached.isAvailable = false;
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    cached.isAvailable = true;
    return cached.conn;
  }

  const now = Date.now();
  if (
    !forceAttempt &&
    cached.isAvailable === false &&
    now - cached.lastCheckedAt < 10_000
  ) {
    return null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        cached.isAvailable = true;
        cached.lastCheckedAt = Date.now();
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        cached.isAvailable = false;
        cached.lastCheckedAt = Date.now();
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    return null;
  }
}

export async function isMongoConnected(forceRefresh = false): Promise<boolean> {
  const conn = await connectToMongoDB(forceRefresh);
  return Boolean(conn && mongoose.connection.readyState === 1);
}

export default connectToMongoDB;
