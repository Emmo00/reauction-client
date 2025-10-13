import { NextRequest, NextResponse } from "next/server";
import { getAuctionContractAddress, getCoinbaseQLSchema } from "@/lib/constants";
import { TransferEvent, OwnedCollectibles } from "@/types/collectible-status";
import { executeCoinbaseqlQuery } from "@/lib/coinbaseql";
import { createPublicClient, http, getContract, getAddress, isAddress } from "viem";
import { getChain, getRPCURL } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { OwnedCollectiblesCacheService } from "@/lib/cache/generic-cache";
import auctionAbi from "@/abis/auction.json";

// Create public client for blockchain interactions
const publicClient = createPublicClient({
  chain: getChain(),
  transport: http(getRPCURL(), {
    batch: true,
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  }),
});

// Get the auction contract instance
const auctionContract = getContract({
  address: getAuctionContractAddress() as `0x${string}`,
  abi: auctionAbi,
  client: publicClient,
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const checksumAddress = getAddress(address);
    const normalizedAddress = checksumAddress.toLowerCase(); // CoinbaSeQL stores addresses in lowercase

    console.log("Fetching owned collectibles for address:", checksumAddress);

    // Connect to MongoDB for caching
    await connectToDatabase();

    // Check cache first
    console.log("Checking cache for address:", checksumAddress);
    const cachedResult = await OwnedCollectiblesCacheService.get(checksumAddress);
    
    if (cachedResult) {
      console.log("Cache hit - returning cached data");
      return NextResponse.json(cachedResult);
    }

    console.log("Cache miss - fetching fresh data from blockchain...");

    // Get the collectible contract address from the auction contract
    console.log("Fetching collectible contract address from auction contract...");
    const collectibleContractAddress = await auctionContract.read.collectible() as `0x${string}`;
    const normalizedCollectibleAddress = collectibleContractAddress.toLowerCase();

    console.log("Collectible contract address:", collectibleContractAddress);

    const schema = getCoinbaseQLSchema();

    // Query all Transfer events where the user is the recipient (to)
    const incomingTransfersQuery = `
      SELECT 
        block_number,
        transaction_hash,
        log_index,
        parameters
      FROM ${schema}.events 
      WHERE address = '${normalizedCollectibleAddress}'
        AND event_name = 'Transfer'
        AND parameters['to'] = '${normalizedAddress}'
      ORDER BY block_number ASC, log_index ASC
    `;

    // Query all Transfer events where the user is the sender (from)
    const outgoingTransfersQuery = `
      SELECT 
        block_number,
        transaction_hash,
        log_index,
        parameters
      FROM ${schema}.events 
      WHERE address = '${normalizedCollectibleAddress}'
        AND event_name = 'Transfer'
        AND parameters['from'] = '${normalizedAddress}'
      ORDER BY block_number ASC, log_index ASC
    `;

    console.log("Fetching incoming transfers...");
    const incomingResponse = await executeCoinbaseqlQuery(incomingTransfersQuery);
    const incomingTransfers = (incomingResponse.result || []) as TransferEvent[];

    console.log("Fetching outgoing transfers...");
    const outgoingResponse = await executeCoinbaseqlQuery(outgoingTransfersQuery);
    const outgoingTransfers = (outgoingResponse.result || []) as TransferEvent[];

    console.log(`Found ${incomingTransfers.length} incoming and ${outgoingTransfers.length} outgoing transfers`);

    // Validate that we have valid transfer events
    if (!Array.isArray(incomingTransfers) || !Array.isArray(outgoingTransfers)) {
      console.error("Invalid response format from CoinbaSeQL API");
      return NextResponse.json(
        { error: "Invalid response format from blockchain data API" }, 
        { status: 500 }
      );
    }

    // Track ownership changes for each token
    const tokenOwnership = new Map<string, boolean>();

    // Process all events chronologically
    const allEvents = [
      ...incomingTransfers.map(event => ({ ...event, type: 'incoming' as const })),
      ...outgoingTransfers.map(event => ({ ...event, type: 'outgoing' as const }))
    ].sort((a, b) => {
      // Sort by block number first, then by log index
      const blockDiff = parseInt(a.block_number) - parseInt(b.block_number);
      if (blockDiff !== 0) return blockDiff;
      return parseInt(a.log_index) - parseInt(b.log_index);
    });

    // Process events to determine current ownership
    for (const event of allEvents) {
      // Validate event structure
      if (!event.parameters || !event.parameters.tokenId) {
        console.warn("Skipping invalid transfer event:", event);
        continue;
      }

      const tokenId = event.parameters.tokenId;
      
      if (event.type === 'incoming') {
        // User received this token
        tokenOwnership.set(tokenId, true);
      } else {
        // User sent this token away
        tokenOwnership.set(tokenId, false);
      }
    }

    // Get all currently owned token IDs
    const ownedTokenIds = Array.from(tokenOwnership.entries())
      .filter(([, isOwned]) => isOwned)
      .map(([tokenId]) => tokenId)
      .sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically

    console.log(`User ${checksumAddress} owns ${ownedTokenIds.length} collectibles`);

    const response: OwnedCollectibles = {
      address: checksumAddress,
      tokenIds: ownedTokenIds,
      count: ownedTokenIds.length,
    };

    // Cache the result (1 hour TTL since ownership can change)
    console.log("Caching result for address:", checksumAddress);
    await OwnedCollectiblesCacheService.set(checksumAddress, response, 1);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching owned collectibles:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to fetch owned collectibles" 
      }, 
      { status: 500 }
    );
  }
}