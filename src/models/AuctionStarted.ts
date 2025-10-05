import mongoose, { Schema, Document } from 'mongoose';

export interface IAuctionStarted extends Document {
  auctionId: string;
  creator: string;
  tokenId: string;
  startAsk: string;
  duration: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  chainId: number;
  createdAt: Date;
}

const AuctionStartedSchema = new Schema<IAuctionStarted>({
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
  startAsk: {
    type: String,
    required: true,
  },
  duration: {
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
AuctionStartedSchema.index({
  chainId: 1,
  blockNumber: 1,
  logIndex: 1,
}, { unique: true });

// Index for creator queries
AuctionStartedSchema.index({
  chainId: 1,
  creator: 1,
  blockNumber: 1,
});

const AuctionStarted = mongoose.models.AuctionStarted || mongoose.model<IAuctionStarted>('AuctionStarted', AuctionStartedSchema);

export default AuctionStarted;