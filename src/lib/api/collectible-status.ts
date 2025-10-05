import { CollectibleStatusResponse } from '@/types/collectible-status';
import { APIClient, queryKeys } from './client';

/**
 * API service for collectible status endpoints
 */
export class CollectibleStatusAPI {
  /**
   * Fetch collectible status for a specific address
   */
  static async getCollectibleStatus(address: string): Promise<CollectibleStatusResponse> {
    return APIClient.get<CollectibleStatusResponse>(`/collectible-status/${address}`);
  }
}

/**
 * Query keys for React Query
 */
export const collectibleStatusQueryKeys = queryKeys.collectibleStatus;