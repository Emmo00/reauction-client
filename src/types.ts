// Type definitions for the collectible status API

import { CastResponse, User } from "@neynar/nodejs-sdk/build/api";

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
      highestBid?: string;
      startAsk?: string;
      amount?: string;
      endTime?: string;
      bidder?: string;
      buyer?: string;
    };
    block_timestamp?: string;
    collectible_address?: string;
    mint_count?: string | number;
    [key: string]: any; // Allow additional properties
  }>;
}

// Types for owned collectibles API
export interface TransferEvent {
  block_number: string;
  transaction_hash: string;
  log_index: string;
  parameters: {
    from: string;
    to: string;
    tokenId: string;
  };
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OwnedCollectibles {
  address: string;
  tokenIds: string[];
  casts: CastResponse[];
  count: number;
  pagination: PaginationInfo;
  collectibleContract: string;
  queryTime: string;
  cached?: boolean;
}

export interface OwnedCollectiblesError {
  error: string;
}

export type OwnedCollectiblesResponse = { data: OwnedCollectibles } | OwnedCollectiblesError;

// Cache document interface
export interface Cache<T = any> {
  key: string;
  data: T;
  createdAt: Date;
  expiresAt: Date;
}

export interface Listing {
  listingId: string;
  tokenId: string;
  listingType: "fixed-price" | "auction";
  listingStatus: "active" | "sold" | "cancelled";
  creator: string;
  buyer?: User | { address: string};
  price?: string;
  highestBid?: string;
  endTime?: string;
  cast: CastResponse;
  auctionStarted: boolean;
  bids?: Array<{
    bidder: User | { address: string};
    amount: string;
  }>;
}

export interface SyncSnapshot {
  syncLock: boolean;
  lastSyncedBlockTimeStamp: string;
}
