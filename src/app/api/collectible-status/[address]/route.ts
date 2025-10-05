import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract, getAddress, isAddress } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { AUCTION_CONTRACT_ADDRESS, BASE_RPC_URL, BASE_SEPOLIA_RPC_URL } from '@/lib/constants';
import auctionAbi from '@/abis/auction.json';
import collectibleAbi from '@/abis/collectible.json';

// Determine which chain to use based on environment
const chain = process.env.NODE_ENV === 'production' ? base : baseSepolia;
const rpcUrl = process.env.NODE_ENV === 'production' ? BASE_RPC_URL : BASE_SEPOLIA_RPC_URL;

// Create public client for blockchain interactions
const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

interface CollectibleStatus {
  address: string;
  castsCollected: number;
  castsBeingSold: number;
  castsSold: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const checksumAddress = getAddress(address);

    // Get the auction contract instance
    const auctionContract = getContract({
      address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
      abi: auctionAbi,
      client: publicClient,
    });

    // Get the collectible contract address from the auction contract
    const collectibleAddress = await auctionContract.read.collectible();

    // Get the collectible contract instance
    const collectibleContract = getContract({
      address: collectibleAddress,
      abi: collectibleAbi,
      client: publicClient,
    });

    // 1. Get number of casts collected (NFT balance)
    const castsCollected = await collectibleContract.read.balanceOf([
      checksumAddress,
    ]);

    // 2. Get current block number for event filtering
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = 0n; // Start from genesis - in production you might want to optimize this

    // 3. Count active listings created by the user
    const listingCreatedLogs = await publicClient.getLogs({
      address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'ListingCreated',
        inputs: [
          { name: 'listingId', type: 'uint256', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: true },
          { name: 'price', type: 'uint256', indexed: false },
        ],
      },
      args: {
        creator: checksumAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    // 4. Count active auctions created by the user
    const auctionStartedLogs = await publicClient.getLogs({
      address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'AuctionStarted',
        inputs: [
          { name: 'auctionId', type: 'uint256', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: true },
          { name: 'startAsk', type: 'uint256', indexed: false },
          { name: 'duration', type: 'uint256', indexed: false },
        ],
      },
      args: {
        creator: checksumAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    // 5. Count completed sales (listings purchased by others from this user)
    const listingPurchasedLogs = await publicClient.getLogs({
      address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'ListingPurchased',
        inputs: [
          { name: 'listingId', type: 'uint256', indexed: true },
          { name: 'buyer', type: 'address', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: false },
          { name: 'price', type: 'uint256', indexed: false },
        ],
      },
      args: {
        creator: checksumAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    // 6. Count settled auctions (auctions settled where this user was the creator)
    const auctionSettledLogs = await publicClient.getLogs({
      address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'AuctionSettled',
        inputs: [
          { name: 'auctionId', type: 'uint256', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'winner', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: false },
          { name: 'finalBid', type: 'uint256', indexed: false },
        ],
      },
      args: {
        creator: checksumAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    // Get cancelled listings and auctions to subtract from active count
    const listingCancelledLogs = await publicClient.getLogs({
      address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'ListingCancelled',
        inputs: [
          { name: 'listingId', type: 'uint256', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: false },
        ],
      },
      args: {
        creator: checksumAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    const auctionCancelledLogs = await publicClient.getLogs({
      address: AUCTION_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'AuctionCancelled',
        inputs: [
          { name: 'auctionId', type: 'uint256', indexed: true },
          { name: 'creator', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: false },
        ],
      },
      args: {
        creator: checksumAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    });

    // Calculate active sales (currently being sold)
    const totalListingsCreated = listingCreatedLogs.length;
    const totalAuctionsCreated = auctionStartedLogs.length;
    const totalListingsSold = listingPurchasedLogs.length;
    const totalAuctionsSold = auctionSettledLogs.length;
    const totalListingsCancelled = listingCancelledLogs.length;
    const totalAuctionsCancelled = auctionCancelledLogs.length;

    const castsBeingSold = 
      (totalListingsCreated + totalAuctionsCreated) - 
      (totalListingsSold + totalAuctionsSold + totalListingsCancelled + totalAuctionsCancelled);

    const castsSold = totalListingsSold + totalAuctionsSold;

    const result: CollectibleStatus = {
      address: checksumAddress,
      castsCollected: Number(castsCollected),
      castsBeingSold: Math.max(0, castsBeingSold), // Ensure non-negative
      castsSold,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching collectible status:', error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('network')) {
        return NextResponse.json(
          { error: 'Network error - unable to connect to blockchain' },
          { status: 503 }
        );
      }
      if (error.message.includes('contract')) {
        return NextResponse.json(
          { error: 'Contract error - unable to read from smart contract' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}