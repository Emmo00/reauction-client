import { NextRequest, NextResponse } from "next/server";
import { ListingService } from "@/services/listing";
import connectToDatabase from "@/lib/mongodb";
import { fetchAuctionFromContract, fetchFixedPriceFromContract } from "@/lib/contract";
import { zeroAddress } from "viem";
import { getFarcasterCastByHash } from "@/lib/neynar";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type");
    const id = (await params).id;

    if (!type) {
      return NextResponse.json({ error: "Missing 'type' parameter" }, { status: 400 });
    }

    if (type !== "auction" && type !== "fixed-price") {
      return NextResponse.json({ error: "Invalid 'type' parameter" }, { status: 400 });
    }

    let listing;

    if (type == "auction") {
      listing = await ListingService.getAuctionListingById(id);
    } else {
      listing = await ListingService.getFixedPriceListingById(id);
    }

    if (!listing) {
      // check onchain first

      if (type == "auction") {
        const listingData = await fetchAuctionFromContract(id);

        if (listingData.creator === zeroAddress) {
          return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        const listingStatus =
          listingData.state === 1
            ? "active"
            : listingData.state === 2
            ? "ended"
            : listingData.state === 3
            ? "settled"
            : "cancelled";

        listing = await ListingService.createListing({
          listingId: id,
          tokenId: listingData.tokenId.toString(),
          listingType: "auction",
          listingStatus,
          creator: listingData.creator,
          cast: (await getFarcasterCastByHash(BigInt(listingData.tokenId).toString(16)))!,
          auctionStarted: listingData.highestBid > BigInt(0),
          auctionEndTime: new Date(Number(listingData.endTime) * 1000).toISOString(),
          listingCreatedAt: new Date().toISOString(),
        });
      }

      if (type == "fixed-price") {
        // check fixed price listing onchain
        const listingData = await fetchFixedPriceFromContract(id);

        if (listingData.creator === zeroAddress) {
          return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        const listingStatus =
          listingData.state === 1 ? "active" : listingData.state === 2 ? "sold" : "cancelled";

        listing = await ListingService.createListing({
          listingId: id,
          tokenId: listingData.tokenId.toString(),
          listingType: "fixed-price",
          listingStatus,
          creator: listingData.creator,
          price: listingData.price.toString(),
          cast: (await getFarcasterCastByHash(BigInt(listingData.tokenId).toString(16)))!,
          auctionStarted: true,
          listingCreatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
