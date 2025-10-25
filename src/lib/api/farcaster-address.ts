import { APIClient, queryKeys } from './client';
import { User } from "@neynar/nodejs-sdk/build/api";

interface FarcasterAddressResult {
  fid: number;
  address: string;
  source: 'farcaster_primary' | 'neynar_verified' | 'neynar_custody';
}

interface FarcasterUserByAddressResult {
  found_on_farcaster: boolean;
  address?: string;
  error?: string;
}

type FarcasterUserResult = FarcasterUserByAddressResult & Partial<User>;

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

  /**
   * Fetch Farcaster user by wallet address
   */
  static async getFarcasterUserByAddress(address: string): Promise<FarcasterUserResult> {
    return APIClient.get<FarcasterUserResult>(`/farcaster/${address}/user`);
  }
}

/**
 * Query keys for React Query
 */
export const farcasterAddressQueryKeys = queryKeys.farcasterAddress;