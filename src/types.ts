// Type definitions for the collectible status API

import { CastResponse, User } from "@neynar/nodejs-sdk/build/api";
import { Hex } from "viem";

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
  buyer?: User | { address: string };
  price?: string;
  highestBid?: string;
  auctionEndTime?: string;
  cast: CastResponse;
  auctionStarted: boolean;
  listingCreatedAt: string;
  bids?: Array<{
    bidder: User | { address: string };
    amount: string;
  }>;
}

export interface SyncSnapshot {
  listingSyncLock: boolean;
  collectibleSyncLock: boolean;
  lastListingSyncedBlockNumber: number;
  lastCollectibleSyncedBlockNumber: number;
}

export interface ParsedEvent {
  eventName: string;
  args: { [key: string]: any };
  transactionHash: Hex;
  blockNumber: Hex;
  timeStamp: Hex;
  data: Hex;
}

export interface AuctionStartedEvent extends ParsedEvent {
  eventName: "AuctionStarted";
  args: {
    auctionId: bigint;
    creator: string;
    tokenId: bigint;
    endtime: bigint;
  };
}

export interface ListingCreatedEvent extends ParsedEvent {
  eventName: "ListingCreated";
  args: {
    listingId: bigint;
    creator: string;
    tokenId: bigint;
    price: bigint;
  };
}
