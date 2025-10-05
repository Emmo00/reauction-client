import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract, getAddress, isAddress } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { AUCTION_CONTRACT_ADDRESS, BASE_RPC_URL, BASE_SEPOLIA_RPC_URL } from '@/lib/constants';
import auctionAbi from '@/abis/auction.json';
import collectibleAbi from '@/abis/collectible.json';
import { ContractSyncService } from '@/lib/contractSyncService';

// Determine which chain to use based on environment
const chain = process.env.NODE_ENV === 'production' ? base : baseSepolia;

// Use HTTP RPC for more reliable connections (WebSocket was causing issues)
const rpcUrl = process.env.NODE_ENV === 'production' ? BASE_RPC_URL : BASE_SEPOLIA_RPC_URL;

// Create public client for blockchain interactions using HTTP
const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl, {
    batch: true,
    timeout: 30000, // 30 second timeout
    retryCount: 3,
    retryDelay: 1000,
  }),
});

interface CollectibleStatus {
  address: string;
  castsCollected: number;
  castsBeingSold: number;
  castsSold: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
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
      address: collectibleAddress as `0x${string}`,
      abi: collectibleAbi,
      client: publicClient,
    });

    // 1. Get number of casts collected (NFT balance)
    const castsCollected = await collectibleContract.read.balanceOf([checksumAddress]);

    // 2. Ensure contract events are synced to current block
    console.log('Syncing contract events to current block...');
    await ContractSyncService.syncToCurrentBlock(publicClient, chain.id);

    // 3. Query events for this specific creator from database
    console.log('Querying events for creator:', checksumAddress);
    const allEvents = await ContractSyncService.getCreatorEvents(chain.id, checksumAddress);

    console.log('Event counts:', {
      listingCreated: allEvents.listingCreated.length,
      auctionStarted: allEvents.auctionStarted.length,
      listingPurchased: allEvents.listingPurchased.length,
      auctionSettled: allEvents.auctionSettled.length,
      listingCancelled: allEvents.listingCancelled.length,
      auctionCancelled: allEvents.auctionCancelled.length,
    });

    // Calculate active sales (currently being sold)
    const totalListingsCreated = allEvents.listingCreated.length;
    const totalAuctionsCreated = allEvents.auctionStarted.length;
    const totalListingsSold = allEvents.listingPurchased.length;
    const totalAuctionsSold = allEvents.auctionSettled.length;
    const totalListingsCancelled = allEvents.listingCancelled.length;
    const totalAuctionsCancelled = allEvents.auctionCancelled.length;

    const castsBeingSold = Math.max(0,
      (totalListingsCreated + totalAuctionsCreated) - 
      (totalListingsSold + totalAuctionsSold + totalListingsCancelled + totalAuctionsCancelled)
    );

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
      if (error.message.includes('network') || error.message.includes('timeout')) {
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
      if (error.message.includes('logs') || error.message.includes('range')) {
        return NextResponse.json(
          { error: 'Block range error - try again later' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
