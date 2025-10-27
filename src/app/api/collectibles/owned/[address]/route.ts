import { NextRequest, NextResponse } from "next/server";
import { Collectible } from "@/types";
import connectToDatabase from "@/lib/mongodb";
import { isAddress } from "viem";
import { CollectibleService } from "@/services/collectibles";

const PER_PAGE = 12;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const url = new URL(request.url);

    // Parse pagination parameters
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const perPage = Math.min(
      20,
      Math.max(1, parseInt(url.searchParams.get("perPage") || PER_PAGE.toString()))
    );

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    console.log(
      `Fetching owned collectibles for address: ${address.toLowerCase()}, page: ${page}, perPage: ${perPage}`
    );

    // Connect to MongoDB for caching
    await connectToDatabase();


    const ownedCollectibles = await CollectibleService.getCollectiblesByOwner(
      address.toLowerCase(),
      {
        page,
        limit: perPage,
      }
    );

    const totalUserCollectibles = await CollectibleService.countCollectiblesByOwner(
      address.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      data: ownedCollectibles,
      pagination: {
        total: totalUserCollectibles,
        currentPage: page,
        perPage,
        hasNextPage: page * perPage < totalUserCollectibles,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching owned collectibles:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch owned collectibles",
      },
      { status: 500 }
    );
  }
}
