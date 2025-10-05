import dbConnect from '@/lib/mongodb';
import CachedLog, { ICachedLog } from '@/models/CachedLog';
import { PublicClient } from 'viem';

export interface LogCacheKey {
  contractAddress: string;
  eventName: string;
  userAddress: string;
  fromBlock: bigint;
  toBlock: bigint;
  chainId: number;
}

export interface LogQueryParams {
  address: string;
  event: {
    type: string;
    name: string;
    inputs: any[];
  };
  args: {
    creator?: string;
    [key: string]: any;
  };
  fromBlock: bigint;
  toBlock: bigint;
}

export class LogCacheService {
  /**
   * Generate a cache key for log queries
   */
  private static generateCacheKey(params: LogQueryParams, chainId: number): LogCacheKey {
    return {
      contractAddress: params.address.toLowerCase(),
      eventName: params.event.name,
      userAddress: params.args.creator?.toLowerCase() || '',
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
      chainId,
    };
  }

  /**
   * Check if we have cached logs for the given parameters
   */
  static async getCachedLogs(params: LogQueryParams, chainId: number): Promise<any[] | null> {
    try {
      await dbConnect();
      
      const cacheKey = this.generateCacheKey(params, chainId);
      
      const cachedEntry = await CachedLog.findOne({
        contractAddress: cacheKey.contractAddress,
        eventName: cacheKey.eventName,
        userAddress: cacheKey.userAddress,
        fromBlock: cacheKey.fromBlock.toString(),
        toBlock: cacheKey.toBlock.toString(),
        chainId: cacheKey.chainId,
        expiresAt: { $gt: new Date() }, // Not expired
      });

      if (cachedEntry) {
        console.log(`Cache HIT for ${cacheKey.eventName} logs from block ${cacheKey.fromBlock} to ${cacheKey.toBlock}`);
        return cachedEntry.logs;
      }

      console.log(`Cache MISS for ${cacheKey.eventName} logs from block ${cacheKey.fromBlock} to ${cacheKey.toBlock}`);
      return null;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }

  /**
   * Store logs in cache
   */
  static async cacheLogs(params: LogQueryParams, chainId: number, logs: any[]): Promise<void> {
    try {
      await dbConnect();
      
      const cacheKey = this.generateCacheKey(params, chainId);
      
      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const cacheEntry = new CachedLog({
        contractAddress: cacheKey.contractAddress,
        eventName: cacheKey.eventName,
        userAddress: cacheKey.userAddress,
        fromBlock: cacheKey.fromBlock.toString(),
        toBlock: cacheKey.toBlock.toString(),
        chainId: cacheKey.chainId,
        logs,
        expiresAt,
      });

      await cacheEntry.save();
      console.log(`Cached ${logs.length} ${cacheKey.eventName} logs from block ${cacheKey.fromBlock} to ${cacheKey.toBlock}`);
    } catch (error) {
      console.error('Error caching logs:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Get logs with caching - checks cache first, then fetches from RPC if needed
   */
  static async getLogsWithCache(
    client: any, // Use any for now to avoid type issues
    params: LogQueryParams,
    chainId: number
  ): Promise<any[]> {
    // Try to get from cache first
    const cachedLogs = await this.getCachedLogs(params, chainId);
    if (cachedLogs !== null) {
      return cachedLogs;
    }

    // If not in cache, fetch from RPC
    try {
      const logs = await client.getLogs(params);
      
      // Cache the results for future use
      await this.cacheLogs(params, chainId, logs);
      
      return logs;
    } catch (error) {
      console.error('Error fetching logs from RPC:', error);
      throw error;
    }
  }

  /**
   * Clear cache entries older than specified time
   */
  static async clearExpiredCache(): Promise<void> {
    try {
      await dbConnect();
      
      const result = await CachedLog.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`Cleared ${result.deletedCount} expired cache entries`);
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    try {
      await dbConnect();
      
      const totalEntries = await CachedLog.countDocuments();
      const stats = await CachedLog.aggregate([
        {
          $group: {
            _id: null,
            totalSize: { $sum: { $size: '$logs' } },
            oldestEntry: { $min: '$createdAt' },
            newestEntry: { $max: '$createdAt' },
          }
        }
      ]);

      return {
        totalEntries,
        totalSize: stats[0]?.totalSize || 0,
        oldestEntry: stats[0]?.oldestEntry || null,
        newestEntry: stats[0]?.newestEntry || null,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }
}

export default LogCacheService;