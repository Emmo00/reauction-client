import mongoose, { Schema, Document } from 'mongoose';

export interface IAuctionSettled extends Document {
  auctionId: string;
  creator: string;
  winner: string;
  tokenId: string;
  finalBid: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  chainId: number;
  createdAt: Date;
}

const AuctionSettledSchema = new Schema<IAuctionSettled>({
  auctionId: {
    type: String,
    required: true,
    index: true,
  },
  creator: {
    type: String,
    required: true,
    index: true,
  },
  winner: {
    type: String,
    required: true,
    index: true,
  },
  tokenId: {
    type: String,
    required: true,
    index: true,
  },
  finalBid: {
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
AuctionSettledSchema.index({
  chainId: 1,
  blockNumber: 1,
  logIndex: 1,
}, { unique: true });

// Index for creator queries
AuctionSettledSchema.index({
  chainId: 1,
  creator: 1,
  blockNumber: 1,
});

const AuctionSettled = mongoose.models.AuctionSettled || mongoose.model<IAuctionSettled>('AuctionSettled', AuctionSettledSchema);

export default AuctionSettled;