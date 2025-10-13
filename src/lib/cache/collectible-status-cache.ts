import { CollectibleStatus } from '@/types/collectible-status';
import { GenericCacheService } from './generic-cache';

export class CollectibleStatusCacheService {
  static generateKey(address: string): string {
    return `collectible-status-${address.toLowerCase()}`;
  }

  static async get(address: string): Promise<CollectibleStatus | null> {
    const key = this.generateKey(address);
    return GenericCacheService.get<CollectibleStatus>(key);
  }

  static async set(address: string, data: CollectibleStatus): Promise<void> {
    const key = this.generateKey(address);
    // Cache for 2 hours like before
    return GenericCacheService.set(key, data, 2);
  }

  static async clear(address?: string): Promise<void> {
    if (address) {
      const key = this.generateKey(address);
      return GenericCacheService.clear(key);
    } else {
      return GenericCacheService.clear('collectible-status-*');
    }
  }

  static async getStats(): Promise<{ totalEntries: number; validEntries: number }> {
    const stats = await GenericCacheService.getStats();
    return { 
      totalEntries: stats.totalEntries, 
      validEntries: stats.validEntries 
    };
  }
}