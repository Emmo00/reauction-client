import mongoose, { Schema, Document } from 'mongoose';

export interface IListingCreated extends Document {
  listingId: string;
  creator: string;
  tokenId: string;
  price: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  chainId: number;
  createdAt: Date;
}

const ListingCreatedSchema = new Schema<IListingCreated>({
  listingId: {
    type: String,
    required: true,
    index: true,
  },
  creator: {
    type: String,
    required: true,
    index: true,
  },
  tokenId: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: String,
    required: true,
  },
  blockNumber: {
    type: String,
    required: true,
    index: true,
  },
  transactionHash: {
    type: String,
    required: true,
    index: true,
  },
  logIndex: {
    type: Number,
    required: true,
  },
  chainId: {
    type: Number,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
ListingCreatedSchema.index({
  chainId: 1,
  blockNumber: 1,
  logIndex: 1,
}, { unique: true });

// Index for creator queries
ListingCreatedSchema.index({
  chainId: 1,
  creator: 1,
  blockNumber: 1,
});

const ListingCreated = mongoose.models.ListingCreated || mongoose.model<IListingCreated>('ListingCreated', ListingCreatedSchema);

export default ListingCreated;