import type { Listing } from "@/types";
import ListingModel from "@/models/listings";

export class ListingService {
  static async createListing(listingData: Listing): Promise<Listing> {
    const listing = new ListingModel(listingData);
    return await listing.save();
  }

  static async getAuctionListingById(listingId: string): Promise<Listing | null> {
    return await ListingModel.findOne({ listingId, listingType: "auction" });
  }

  static async getFixedPriceListingById(listingId: string): Promise<Listing | null> {
    return await ListingModel.findOne({ listingId, listingType: "fixed-price" });
  }

  static async updateAuctionListing(
    listingId: string,
    updateData: Partial<Listing>
  ): Promise<Listing | null> {
    return await ListingModel.findOneAndUpdate({ listingId, listingType: "auction" }, updateData, {
      new: true,
    });
  }

  static async updateFixedPriceListing(
    listingId: string,
    updateData: Partial<Listing>
  ): Promise<Listing | null> {
    return await ListingModel.findOneAndUpdate(
      { listingId, listingType: "fixed-price" },
      updateData,
      { new: true }
    );
  }

  static async addBidToListing(
    listingId: string,
    bidder: NonNullable<Listing["bids"]>[0]["bidder"],
    amount: string
  ): Promise<Listing | null> {
    return await ListingModel.findOneAndUpdate(
      { listingId, listingType: "auction" },
      { $push: { bids: { bidder, amount } } },
      { new: true }
    );
  }

  static async auctionExists(auctionId: string): Promise<boolean> {
    const auction = await ListingModel.findOne({ 
      listingId: auctionId, 
      listingType: "auction" 
    });
    return auction !== null;
  }

  static async fixedListingExists(listingId: string): Promise<boolean> {
    const listing = await ListingModel.findOne({ 
      listingId, 
      listingType: "fixed-price" 
    });
    return listing !== null;
  }

  static async getListings({
    limit,
    page,
    listingType,
  }: {
    limit: number;
    page: number;
    listingType?: "auction" | "fixed-price";
  }): Promise<Listing[]> {
    const offset = (page - 1) * limit;
    return await ListingModel.find(listingType ? { listingType } : {})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  static async countListings({
    listingType,
  }: {
    listingType?: "auction" | "fixed-price";
  }): Promise<number> {
    return await ListingModel.countDocuments({ listingType });
  }
}
