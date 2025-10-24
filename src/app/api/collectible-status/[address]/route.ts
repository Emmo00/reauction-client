import { NextRequest, NextResponse } from "next/server";
import {
  getAuctionContractAddress,
  getCoinbaseQLSchema,
  getCollectibleContractAddress,
  getPublicClient,
} from "@/lib/constants";
import { CollectibleStatus } from "@/types";
import { executeCoinbaseqlQuery } from "@/lib/coinbaseql";
import { getContract, getAddress, isAddress } from "viem";
import connectToDatabase from "@/lib/mongodb";
import { CollectibleStatusCacheService } from "@/services/cache";
import collectibleAbi from "@/abis/collectible.json";

export async function GET(_: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const checksumAddress = getAddress(address);
    const lowerAddress = checksumAddress.toLowerCase(); // CoinbaSeQL stores addresses in lowercase

    // Connect to MongoDB
    await connectToDatabase();

    // Check cache first
    console.log("Checking cache for address:", checksumAddress);
    const cachedResult = await CollectibleStatusCacheService.get(checksumAddress);

    if (cachedResult) {
      console.log("Cache hit - returning cached data");
      return NextResponse.json(cachedResult);
    }

    console.log("Cache miss - fetching fresh data");

    // Get environment-specific values
    const auctionContractAddress = getAuctionContractAddress().toLowerCase();
    const schema = getCoinbaseQLSchema();

    console.log("Fetching collectible status for address:", checksumAddress);
    console.log("Using contract address:", auctionContractAddress);
    console.log("Using schema:", schema);

    // Query for auction and listing events related to this creator
    const eventsQuery = `
      SELECT 
        event_name,
        parameters,
        block_timestamp
      FROM ${schema}.events
      WHERE address = '${auctionContractAddress}'
        AND (
          (event_name = 'ListingCreated' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'AuctionStarted' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'ListingPurchased' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'AuctionSettled' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'ListingCancelled' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'AuctionCancelled' AND parameters['creator'] = '${lowerAddress}')
        )
      ORDER BY block_timestamp DESC
    `;

    // Execute the query
    const eventsResult = await executeCoinbaseqlQuery(eventsQuery);

    console.log("events result", eventsResult);

    // Process events to calculate stats
    let castsBeingSold = 0;
    let castsSold = 0;

    // Track active listings and auctions
    const activeListings = new Set<string>();
    const activeAuctions = new Set<string>();

    // Process events chronologically (oldest first)
    const events = eventsResult.result?.reverse() ?? [];

    for (const event of events) {
      const { event_name, parameters } = event;

      if (!event_name || !parameters) continue;

      switch (event_name) {
        case "ListingCreated":
          if (parameters.listingId) {
            activeListings.add(parameters.listingId);
          }
          break;

        case "AuctionStarted":
          if (parameters.auctionId) {
            activeAuctions.add(parameters.auctionId);
          }
          break;

        case "ListingPurchased":
          if (parameters.listingId) {
            activeListings.delete(parameters.listingId);
            castsSold++;
          }
          break;

        case "AuctionSettled":
          if (parameters.auctionId) {
            activeAuctions.delete(parameters.auctionId);
            if (
              parameters.winner &&
              parameters.winner !== "0x0000000000000000000000000000000000000000"
            ) {
              castsSold++;
            }
          }
          break;

        case "ListingCancelled":
          if (parameters.listingId) {
            activeListings.delete(parameters.listingId);
          }
          break;

        case "AuctionCancelled":
          if (parameters.auctionId) {
            activeAuctions.delete(parameters.auctionId);
          }
          break;
      }
    }

    // Active listings and auctions are casts being sold
    castsBeingSold = activeListings.size + activeAuctions.size;

    // Query the auction contract to get the collectible address
    console.log("Querying auction contract for collectible address...");
    let collectibleAddress = getCollectibleContractAddress();

    // Get the collectible contract instance
    const collectibleContract = getContract({
      address: collectibleAddress as `0x${string}`,
      abi: collectibleAbi,
      client: getPublicClient(),
    });

    let castsOwned = await collectibleContract.read.balanceOf([checksumAddress]);

    // Query for Transfer events to calculate castsCollected (minted to this address)
    const mintedQuery = `
      SELECT 
        COUNT(*) as mint_count
      FROM ${schema}.events
      WHERE address = '${collectibleAddress.toLowerCase()}'
        AND event_name = 'Transfer'
        AND parameters['to'] = '${lowerAddress}'
        AND parameters['from'] = '0x0000000000000000000000000000000000000000'
    `;

    const mintedResult = await executeCoinbaseqlQuery(mintedQuery);
    let castsCollected = Number(mintedResult.result?.[0]?.mint_count || 0);

    const collectibleStatus: CollectibleStatus = {
      address: checksumAddress,
      castsCollected: Number(castsCollected),
      castsOwned: Number(castsOwned),
      castsBeingSold,
      castsSold,
    };

    // Cache the result (async - don't wait for it to complete)
    CollectibleStatusCacheService.set(checksumAddress, collectibleStatus).catch((error) => {
      console.error("Failed to cache collectible status:", error);
    });

    console.log("Collectible status result:", collectibleStatus);

    return NextResponse.json(collectibleStatus);
  } catch (error) {
    console.error("Error fetching collectible status:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch collectible status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
