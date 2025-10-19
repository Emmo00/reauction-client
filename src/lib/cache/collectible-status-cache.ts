import { CollectibleStatus } from '@/types/collectible-status';
import { CacheService } from './cache';

export class CollectibleStatusCacheService {
  private static readonly PREFIX = 'collectible-status';

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