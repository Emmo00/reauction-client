import mongoose, { Schema } from "mongoose";
import type { Listing } from "@/types";
import type { Document } from "mongoose";

const ListingSchema = new Schema<Listing & Document>(
  {
    tokenId: {
      type: String,
      required: true,
    },
    listingId: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: false,
    },
    highestBid: {
      type: String,
      required: false,
      default: "0",
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
    listingCreatedAt: {
      type: String,
      required: true,
    },
    bids: {
      type: [
        {
          bidder: {
            type: Object,
            required: true,
          },
          amount: {
            type: String,
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
ListingSchema.index({ listingId: 1, listingType: 1 });

const ListingModel = mongoose.models.Listing || mongoose.model<Listing>("Listing", ListingSchema);

export default ListingModel;
