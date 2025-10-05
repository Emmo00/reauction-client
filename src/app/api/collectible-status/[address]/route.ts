import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract, getAddress, isAddress } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { AUCTION_CONTRACT_ADDRESS, BASE_RPC_URL, BASE_SEPOLIA_RPC_URL } from '@/lib/constants';
import auctionAbi from '@/abis/auction.json';
import collectibleAbi from '@/abis/collectible.json';

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

    // 2. Get current block number for event filtering
    const currentBlock = await publicClient.getBlockNumber();
    console.log('Current Block:', currentBlock);
    
    // Use a more recent starting block to reduce query load and avoid timeouts
    // Start from 10,000 blocks ago instead of genesis
    const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

    console.log('Querying from block:', fromBlock, 'to block:', currentBlock);

    // Query events in smaller chunks to avoid RPC timeouts
    const maxBlockRange = 2000n;
    let allEvents = {
      listingCreated: [] as any[],
      auctionStarted: [] as any[],
      listingPurchased: [] as any[],
      auctionSettled: [] as any[],
      listingCancelled: [] as any[],
      auctionCancelled: [] as any[],
    };

    // Process blocks in chunks
    for (let start = fromBlock; start <= currentBlock; start += maxBlockRange) {
      const end = start + maxBlockRange - 1n > currentBlock ? currentBlock : start + maxBlockRange - 1n;
      
      console.log(`Processing blocks ${start} to ${end}`);

      try {
        // Get all event types for this block range
        const [
          listingCreatedLogs,
          auctionStartedLogs,
          listingPurchasedLogs,
          auctionSettledLogs,
          listingCancelledLogs,
          auctionCancelledLogs,
        ] = await Promise.all([
          // Listing Created events
          publicClient.getLogs({
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
            fromBlock: start,
            toBlock: end,
          }),
          
          // Auction Started events
          publicClient.getLogs({
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
            fromBlock: start,
            toBlock: end,
          }),
          
          // Listing Purchased events
          publicClient.getLogs({
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
            fromBlock: start,
            toBlock: end,
          }),
          
          // Auction Settled events
          publicClient.getLogs({
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
            fromBlock: start,
            toBlock: end,
          }),
          
          // Listing Cancelled events
          publicClient.getLogs({
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
            fromBlock: start,
            toBlock: end,
          }),
          
          // Auction Cancelled events
          publicClient.getLogs({
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
            fromBlock: start,
            toBlock: end,
          }),
        ]);

        // Aggregate results
        allEvents.listingCreated.push(...listingCreatedLogs);
        allEvents.auctionStarted.push(...auctionStartedLogs);
        allEvents.listingPurchased.push(...listingPurchasedLogs);
        allEvents.auctionSettled.push(...auctionSettledLogs);
        allEvents.listingCancelled.push(...listingCancelledLogs);
        allEvents.auctionCancelled.push(...auctionCancelledLogs);

      } catch (chunkError) {
        console.error(`Error processing blocks ${start} to ${end}:`, chunkError);
        // Continue with next chunk even if one fails
      }
    }

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
