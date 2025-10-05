import mongoose, { Schema, Document } from 'mongoose';

export interface IAuctionCancelled extends Document {
  auctionId: string;
  creator: string;
  tokenId: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  chainId: number;
  createdAt: Date;
}

const AuctionCancelledSchema = new Schema<IAuctionCancelled>({
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
  tokenId: {
    type: String,
    required: true,
    index: true,
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
AuctionCancelledSchema.index({
  chainId: 1,
  blockNumber: 1,
  logIndex: 1,
}, { unique: true });

// Index for creator queries
AuctionCancelledSchema.index({
  chainId: 1,
  creator: 1,
  blockNumber: 1,
});

const AuctionCancelled = mongoose.models.AuctionCancelled || mongoose.model<IAuctionCancelled>('AuctionCancelled', AuctionCancelledSchema);

export default AuctionCancelled;