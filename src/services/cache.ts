import type { CollectibleStatus } from "@/types";
import CacheModel from "@/models/cache";

export class CacheService {
  /**
   * Get cached data by key
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await CacheModel.findOne({
        key,
        expiresAt: { $gt: new Date() }, // Ensure not expired
      });

      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return cached.data as T;
      }

      console.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  }

  /**
   * Set cached data with optional TTL
   */
  static async set<T>(key: string, data: T, ttlHours: number = 2): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

      await CacheModel.findOneAndUpdate(
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
      console.error("Error writing to cache:", error);
      // Don't throw error - caching is optional
    }
  }

  /**
   * Clear cached data by key or pattern
   */
  static async clear(keyOrPattern?: string): Promise<void> {
    try {
      if (keyOrPattern) {
        // Support both exact key match and pattern matching
        const query = keyOrPattern.includes("*")
          ? { key: { $regex: keyOrPattern.replace(/\*/g, ".*") } }
          : { key: keyOrPattern };

        const result = await CacheModel.deleteMany(query);
        console.log(`Cleared ${result.deletedCount} cache entries for pattern: ${keyOrPattern}`);
      } else {
        const result = await CacheModel.deleteMany({});
        console.log(`Cleared all ${result.deletedCount} cache entries`);
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
  }> {
    try {
      const totalEntries = await CacheModel.countDocuments();
      const validEntries = await CacheModel.countDocuments({
        expiresAt: { $gt: new Date() },
      });
      const expiredEntries = totalEntries - validEntries;

      return { totalEntries, validEntries, expiredEntries };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return { totalEntries: 0, validEntries: 0, expiredEntries: 0 };
    }
  }

  /**
   * Get or set pattern - useful for caching expensive operations
   */
  static async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlHours: number = 2
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch fresh data
    console.log(`Cache miss for key: ${key}, fetching fresh data...`);
    const freshData = await fetchFunction();

    // Cache the result
    await this.set(key, freshData, ttlHours);

    return freshData;
  }
}

// Specific cache services can extend this for type safety
export class OwnedCollectiblesCacheService {
  static generateKey(address: string): string {
    return `owned-collectibles-${address.toLowerCase()}`;
  }

  static async get(address: string) {
    const key = this.generateKey(address);
    return CacheService.get(key);
  }

  static async set(address: string, data: any, ttlHours: number = 1) {
    const key = this.generateKey(address);
    return CacheService.set(key, data, ttlHours);
  }

  static async clear(address?: string) {
    if (address) {
      const key = this.generateKey(address);
      return CacheService.clear(key);
    } else {
      return CacheService.clear("owned-collectibles-*");
    }
  }
}

export class CollectibleStatusCacheService {
  private static readonly PREFIX = "collectible-status";

  static generateKey(address: string): string {
    return `${this.PREFIX}:${address.toLowerCase()}`;
  }

  static async get(address: string): Promise<CollectibleStatus | null> {
    const key = this.generateKey(address);
    return CacheService.get<CollectibleStatus>(key);
  }

  static async set(address: string, data: CollectibleStatus, ttlHours: number = 2): Promise<void> {
    const key = this.generateKey(address);
    return CacheService.set(key, data, ttlHours);
  }

  static async clear(address?: string): Promise<void> {
    if (address) {
      const key = this.generateKey(address);
      return CacheService.clear(key);
    } else {
      return CacheService.clear(`${this.PREFIX}:*`);
    }
  }
}
