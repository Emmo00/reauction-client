import { NextRequest, NextResponse } from "next/server";
import {
  getAuctionContractAddress,
  getCollectibleContractAddress,
  getPublicClient,
} from "@/lib/constants";
import { CollectibleStatus } from "@/types";
import { getContract, getAddress, isAddress } from "viem";
import connectToDatabase from "@/lib/mongodb";
import collectibleAbi from "@/abis/collectible.json";
import { ListingService } from "@/services/listing";

export async function GET(_: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const checksumAddress = getAddress(address);
    const lowerAddress = checksumAddress.toLowerCase(); // CoinbaSeQL stores addresses in lowercase

    // Process events to calculate stats
    const castsBeingSold = await ListingService.getUserActiveListingsCount(lowerAddress);
    const castsSold = await ListingService.getUserCompletedListingsCount(lowerAddress);

    const collectibleAddress = getCollectibleContractAddress();
    // Get the collectible contract instance
    const collectibleContract = getContract({
      address: collectibleAddress as `0x${string}`,
      abi: collectibleAbi,
      client: getPublicClient(),
    });

    const castsOwned = Number(await collectibleContract.read.balanceOf([checksumAddress]));

    const collectibleStatus: CollectibleStatus = {
      address: checksumAddress,
      castsOwned,
      castsBeingSold,
      castsSold,
    };

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
