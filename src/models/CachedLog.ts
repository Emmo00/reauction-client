import mongoose, { Schema, Document } from 'mongoose';

// Interface for a cached log entry
export interface ICachedLog extends Document {
  contractAddress: string;
  eventName: string;
  userAddress: string;
  fromBlock: string;
  toBlock: string;
  chainId: number;
  logs: any[];
  createdAt: Date;
  expiresAt: Date;
}

// Schema for cached blockchain logs
const CachedLogSchema = new Schema<ICachedLog>({
  contractAddress: {
    type: String,
    required: true,
    index: true,
  },
  eventName: {
    type: String,
    required: true,
    index: true,
  },
  userAddress: {
    type: String,
    required: true,
    index: true,
  },
  fromBlock: {
    type: String,
    required: true,
  },
  toBlock: {
    type: String,
    required: true,
  },
  chainId: {
    type: Number,
    required: true,
    index: true,
  },
  logs: [{
    type: Schema.Types.Mixed,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 0, // TTL will be set when creating the index
  },
});

// Compound index for efficient queries
CachedLogSchema.index({
  contractAddress: 1,
  eventName: 1,
  userAddress: 1,
  chainId: 1,
  fromBlock: 1,
  toBlock: 1,
});

// TTL index for automatic document expiration (24 hours)
CachedLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

// Export the model
const CachedLog = mongoose.models.CachedLog || mongoose.model<ICachedLog>('CachedLog', CachedLogSchema);

export default CachedLog;