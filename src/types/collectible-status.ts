// Type definitions for the collectible status API

export interface CollectibleStatus {
  /** The Ethereum address being queried */
  address: string;
  /** Number of collectible casts (NFTs) owned by this address */
  castsCollected: number;
  /** Number of collectible casts currently listed for sale (auctions + fixed price) */
  castsBeingSold: number;
  /** Number of collectible casts that have been sold by this address */
  castsSold: number;
}

export interface CollectibleStatusError {
  error: string;
}

export type CollectibleStatusResponse = CollectibleStatus | CollectibleStatusError;