// Type definitions for the collectible status API

import { CastResponse } from "@neynar/nodejs-sdk/build/api";

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

import type { Document } from "mongoose";

// Cache document interface
export interface Cache<T = any> extends Document {
  key: string;
  data: T;
  createdAt: Date;
  expiresAt: Date;
}

export interface Listing extends Document {
  listingId: number;
  tokenId: number;
  type: "fixed-price" | "auction";
  creator: string;
  price?: string;
  highestBid?: string;
  cast: CastResponse;
  createdAt: Date;
  expiresAt: Date;
}

export interface SyncSnapshot extends Document {
  lastSyncedBlockTimeStamp: string;
}
