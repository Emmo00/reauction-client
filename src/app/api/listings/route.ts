import { NextRequest, NextResponse } from "next/server";
import { ListingService } from "@/services/listing";
import connectToDatabase from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const listingTypeParam = searchParams.get("listingType");

    const limit = limitParam ? parseInt(limitParam) : 10;
    const page = pageParam ? parseInt(pageParam) : 1;
    const listingType = listingTypeParam
      ? (listingTypeParam as "auction" | "fixed-price")
      : undefined;

    const listings = await ListingService.getListings(
      listingType ? { limit, page, listingType } : { limit, page }
    );

    console.log(`Fetched ${listings.length} listings from DB`);

    const totalCount = await ListingService.countListings(listingType ? { listingType } : {});

    return NextResponse.json({ listings, totalCount, hasMore: totalCount > page * limit });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
