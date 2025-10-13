import mongoose, { Schema, Document } from 'mongoose';
import { CollectibleStatus } from '@/types/collectible-status';

export interface CollectibleStatusCache extends Document {
  key: string; // collection-status-{address}
  data: CollectibleStatus;
  createdAt: Date;
  expiresAt: Date;
}

const CollectibleStatusCacheSchema = new Schema<CollectibleStatusCache>({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    address: { type: String, required: true },
    castsCollected: { type: Number, required: true },
    castsOwned: { type: Number, required: true },
    castsBeingSold: { type: Number, required: true },
    castsSold: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    expires: 0, // MongoDB TTL index - documents will be automatically deleted when expiresAt is reached
  },
});

// Create compound index for efficient queries
CollectibleStatusCacheSchema.index({ key: 1, expiresAt: 1 });

export const CollectibleStatusCacheModel = 
  mongoose.models.CollectibleStatusCache || 
  mongoose.model<CollectibleStatusCache>('CollectibleStatusCache', CollectibleStatusCacheSchema);

export class CollectibleStatusCacheService {
  static generateKey(address: string): string {
    return `collection-status-${address}`;
  }

  static async get(address: string): Promise<CollectibleStatus | null> {
    try {
      const key = this.generateKey(address);
      const cached = await CollectibleStatusCacheModel.findOne({
        key,
        expiresAt: { $gt: new Date() }, // Ensure not expired
      });

      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return cached.data;
      }

      console.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  static async set(address: string, data: CollectibleStatus): Promise<void> {
    try {
      const key = this.generateKey(address);
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

      await CollectibleStatusCacheModel.findOneAndUpdate(
        { key },
        {
          key,
          data,
          createdAt: new Date(),
          expiresAt,
        },
        {
          upsert: true, // Create if doesn't exist, update if exists
          new: true,
        }
      );

      console.log(`Cached data for key: ${key}, expires at: ${expiresAt.toISOString()}`);
    } catch (error) {
      console.error('Error writing to cache:', error);
      // Don't throw error - caching is optional
    }
  }

  static async clear(address?: string): Promise<void> {
    try {
      if (address) {
        const key = this.generateKey(address);
        await CollectibleStatusCacheModel.deleteOne({ key });
        console.log(`Cleared cache for key: ${key}`);
      } else {
        await CollectibleStatusCacheModel.deleteMany({});
        console.log('Cleared all cache entries');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  static async getStats(): Promise<{ totalEntries: number; validEntries: number }> {
    try {
      const totalEntries = await CollectibleStatusCacheModel.countDocuments();
      const validEntries = await CollectibleStatusCacheModel.countDocuments({
        expiresAt: { $gt: new Date() },
      });

      return { totalEntries, validEntries };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalEntries: 0, validEntries: 0 };
    }
  }
}