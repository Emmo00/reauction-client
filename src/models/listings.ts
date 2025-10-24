import mongoose, { Schema } from "mongoose";
import type { Listing } from "@/types";

const ListingSchema = new Schema<Listing>({
  tokenId: {
    type: Number,
    required: true,
  },
  listingId: {
    type: Number,
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
  },
  cast: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create compound index for efficient queries
ListingSchema.index({ listingId: 1, tokenId: 1 });

const ListingModel = mongoose.models.Listing || mongoose.model<Listing>("Listing", ListingSchema);

export default ListingModel;
