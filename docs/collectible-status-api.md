# Collectible Status API

## Overview

This API provides information about a Farcaster user's collectible cast (NFT) status by querying the blockchain directly.

## Endpoints

### GET `/api/collectible-status/[address]`

Returns the collectible status for a given Ethereum address.

#### Parameters
- `address` (string): Ethereum address to query

#### Response
```json
{
  "address": "0x742d35cc6671c0532925a3b8d5fb3c0b3c70c56c",
  "castsCollected": 5,
  "castsBeingSold": 2,
  "castsSold": 3
}
```

#### Error Response
```json
{
  "error": "Invalid Ethereum address"
}
```

### GET `/api/farcaster-address/[fid]`

Returns the wallet address associated with a Farcaster FID.

#### Parameters
- `fid` (string): Farcaster ID to query

#### Response
```json
{
  "fid": 12345,
  "address": "0x742d35cc6671c0532925a3b8d5fb3c0b3c70c56c",
  "source": "farcaster_primary"
}
```

### GET `/api/test-blockchain`

Tests the blockchain connection and returns network information.

#### Response
```json
{
  "success": true,
  "network": "Base Sepolia",
  "rpcUrl": "https://sepolia.base.org",
  "auctionContract": "0x9086D4F1c87FD80B11BE3E10895C49e20a44b91e",
  "currentBlock": "12345678"
}
```

## Data Sources

The API fetches data from:

1. **Collectible Contract**: To get the number of NFTs owned by the user
2. **Auction Contract Events**: To count listings, auctions, and sales
3. **Farcaster API**: To resolve FID to wallet address
4. **Neynar API**: As fallback for address resolution

## Smart Contract Events Tracked

- `ListingCreated`: When a user creates a fixed-price listing
- `ListingPurchased`: When someone buys a user's listing
- `ListingCancelled`: When a user cancels their listing
- `AuctionStarted`: When a user starts an auction
- `AuctionSettled`: When a user's auction is settled with a winner
- `AuctionCancelled`: When a user cancels their auction

## React Hooks

### `useCollectibleStatus(address?: string)`

Hook to fetch collectible status for an address.

```tsx
const { status, loading, error } = useCollectibleStatus("0x742d35cc...");
```

### `useFarcasterAddress(fid?: number)`

Hook to get wallet address from Farcaster FID.

```tsx
const { address, loading, error, source } = useFarcasterAddress(12345);
```

## Environment Variables

Required environment variables:

```env
# Optional: Custom RPC URLs (defaults to public endpoints)
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Optional: For better address resolution
NEYNAR_API_KEY=your_neynar_api_key
```

## Network Configuration

- **Production**: Base Mainnet
- **Development**: Base Sepolia

The API automatically switches between networks based on `NODE_ENV`.

## Error Handling

The API includes comprehensive error handling for:

- Invalid addresses
- Network connectivity issues
- Contract interaction failures
- API rate limits
- Missing data

## Rate Limiting

Consider implementing rate limiting in production to prevent abuse of the blockchain RPC endpoints.

## Performance Considerations

- Event queries start from block 0 - consider optimizing with indexed start blocks
- Multiple contract calls are made - consider caching for frequently queried addresses
- Blockchain RPC calls can be slow - implement appropriate timeouts