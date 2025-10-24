import type { Listing } from "@/types";
import ListingModel from "@/models/listings";

export class ListingService {
  static async createListing(listingData: Listing): Promise<Listing> {
    const listing = new ListingModel(listingData);
    return await listing.save();
  }

  static async getListingById(listingId: number): Promise<Listing | null> {
    return await ListingModel.findOne({ listingId });
  }

  static async updateAuctionListing(
    listingId: number,
    updateData: Partial<Listing>
  ): Promise<Listing | null> {
    return await ListingModel.findOneAndUpdate({ listingId, listingType: "auction" }, updateData, {
      new: true,
    });
  }

  static async updateFixedPriceListing(
    listingId: number,
    updateData: Partial<Listing>
  ): Promise<Listing | null> {
    return await ListingModel.findOneAndUpdate(
      { listingId, listingType: "fixed-price" },
      updateData,
      { new: true }
    );
  }

  static async deleteListing(listingId: number): Promise<void> {
    await ListingModel.deleteOne({ listingId });
  }

  static async deleteManyListings(listingIds: number[]): Promise<void> {
    await ListingModel.deleteMany({ listingId: { $in: listingIds } });
  }

  static async addBidToListing(
    listingId: number,
    bidder: NonNullable<Listing["bids"]>[0]["bidder"],
    amount: bigint
  ): Promise<Listing | null> {
    return await ListingModel.findOneAndUpdate(
      { listingId, listingType: "auction" },
      { $push: { bids: { bidder, amount } } },
      { new: true }
    );
  }

  static async listingExists(listingId: number): Promise<boolean> {
    const count = await ListingModel.countDocuments({ listingId });
    return count > 0;
  }

  static async getListings({ limit, page }: { limit: number; page: number }): Promise<Listing[]> {
    const offset = (page - 1) * limit;
    return await ListingModel.find().skip(offset).limit(limit).exec();
  }

  static async countListings(): Promise<number> {
    return await ListingModel.countDocuments();
  }
}
