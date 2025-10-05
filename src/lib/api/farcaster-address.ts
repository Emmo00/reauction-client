import { APIClient, queryKeys } from './client';

interface FarcasterAddressResult {
  fid: number;
  address: string;
  source: 'farcaster_primary' | 'neynar_verified' | 'neynar_custody';
}

/**
 * API service for Farcaster address endpoints
 */
export class FarcasterAddressAPI {
  /**
   * Fetch wallet address for a specific FID
   */
  static async getFarcasterAddress(fid: number): Promise<FarcasterAddressResult> {
    return APIClient.get<FarcasterAddressResult>(`/farcaster-address/${fid}`);
  }
}

/**
 * Query keys for React Query
 */
export const farcasterAddressQueryKeys = queryKeys.farcasterAddress;