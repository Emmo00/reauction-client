import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import connectToDatabase from "@/lib/mongodb";
import { OwnedCollectiblesCacheService } from "@/lib/cache/generic-cache";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const checksumAddress = getAddress(address);

    console.log("Clearing cache for address:", checksumAddress);

    // Connect to MongoDB
    await connectToDatabase();

    // Clear the cache for this address
    await OwnedCollectiblesCacheService.clear(checksumAddress);

    return NextResponse.json({ 
      success: true, 
      message: `Cache cleared for address: ${checksumAddress}` 
    });

  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to clear cache" 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const checksumAddress = getAddress(address);

    // Connect to MongoDB
    await connectToDatabase();

    // Get cache info for this address
    const cachedData = await OwnedCollectiblesCacheService.get(checksumAddress);

    return NextResponse.json({ 
      address: checksumAddress,
      cached: cachedData !== null,
      data: cachedData,
    });

  } catch (error) {
    console.error("Error getting cache info:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to get cache info" 
      }, 
      { status: 500 }
    );
  }
}