import { CollectibleStatusResponse, OwnedCollectiblesResponse } from "@/types";
import { APIClient, queryKeys } from "./client";

/**
 * API service for collectible status endpoints
 */
export class CollectiblesAPI {
  /**
   * Fetch collectible status for a specific address
   */
  static async getCollectibleStatus(address: string): Promise<CollectibleStatusResponse> {
    return APIClient.get<CollectibleStatusResponse>(`/collectible-status/${address}`);
  }

  static async getCollectiblesOwnedByAddress(
    address: string,
    page: number = 1,
    perPage: number = 20
  ) {
    return APIClient.get<OwnedCollectiblesResponse>(
      `/collectibles/owned/${address}?page=${page}&perPage=${perPage}`
    );
  }
}

/**
 * Query keys for React Query
 */
export const collectibleStatusQueryKeys = queryKeys.collectibles;
