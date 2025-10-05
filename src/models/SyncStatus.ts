import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncStatus extends Document {
  contractAddress: string;
  chainId: number;
  lastSyncedBlock: string;
  startBlock: string;
  isInitialized: boolean;
  lastUpdated: Date;
}

const SyncStatusSchema = new Schema<ISyncStatus>({
  contractAddress: {
    type: String,
    required: true,
    index: true,
  },
  chainId: {
    type: Number,
    required: true,
    index: true,
  },
  lastSyncedBlock: {
    type: String,
    required: true,
  },
  startBlock: {
    type: String,
    required: true,
    default: '31942142',
  },
  isInitialized: {
    type: Boolean,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index
SyncStatusSchema.index({
  contractAddress: 1,
  chainId: 1,
}, { unique: true });

const SyncStatus = mongoose.models.SyncStatus || mongoose.model<ISyncStatus>('SyncStatus', SyncStatusSchema);

export default SyncStatus;