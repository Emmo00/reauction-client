import { NextRequest, NextResponse } from "next/server";
import { ListingService } from "@/services/listing";
import connectToDatabase from "@/lib/mongodb";

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
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
