import mongoose, { Schema } from "mongoose";
import type { Listing } from "@/types";
import type { Document } from "mongoose";

const ListingSchema = new Schema<Listing & Document>(
  {
    tokenId: {
      type: BigInt,
      required: true,
    },
    listingId: {
      type: BigInt,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    price: {
      type: BigInt,
      required: false,
    },
    highestBid: {
      type: BigInt,
      required: false,
    },
    cast: {
      type: Object,
      required: true,
    },
    listingType: {
      type: String,
      enum: ["fixed-price", "auction"],
      required: true,
    },
    listingStatus: {
      type: String,
      enum: ["active", "sold", "cancelled"],
      required: true,
    },
    auctionStarted: {
      type: Boolean,
      default: false,
    },
    buyer: {
      type: Object,
      required: false,
    },
    bids: {
      type: [
        {
          bidder: {
            type: Object,
            required: true,
          },
          amount: {
            type: BigInt,
            required: true,
          },
        },
      ],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

// Create compound index for efficient queries
ListingSchema.index({ listingType: 1 });
ListingSchema.index({ listingId: 1, listingType: 1 });

const ListingModel = mongoose.models.Listing || mongoose.model<Listing>("Listing", ListingSchema);

export default ListingModel;
