import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ListingModel from "@/models/listings";

// get cached block time from last synced listing for auctions
// get cacked block time from last synced listing for listings

// fetch AuctionStarted events after this time
// fetch AuctionSettled events after this time
// fetch AuctionCancelled events after this time

// fetch ListingCreated events after this time
// fetch ListingPurchased events after this time
// fetch ListingCancelled events after this time

// go through list of settled and cancelled auctions and remove from listings db
// go through list of purchased and cancelled listings and remove from listings db

// add the remaining AuctionStarted events to listings db
// add the remaining ListingCreated events to listings db

// update highest bid price by fetching the BidPlaced events for each active auction (after last synced time)

export async function POST(_: NextRequest) {
  try {
    await connectToDatabase();

    
  } catch (error) {
    console.error("Error syncing listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
