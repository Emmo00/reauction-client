// Type definitions for the collectible status API

export interface CollectibleStatusError {
  error: string;
}

export type CollectibleStatusResponse = CollectibleStatus | CollectibleStatusError;

export interface CollectibleStatus {
  address: string;
  castsCollected: number;
  castsOwned: number;
  castsBeingSold: number;
  castsSold: number;
}

export interface SqlApiResponse {
  result: Array<{
    event_name?: string;
    parameters?: {
      creator?: string;
      winner?: string;
      tokenId?: string;
      listingId?: string;
      auctionId?: string;
      from?: string;
      to?: string;
    };
    block_timestamp?: string;
    collectible_address?: string;
    mint_count?: string | number;
    [key: string]: any; // Allow additional properties
  }>;
}
