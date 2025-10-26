import mongoose, { Schema } from "mongoose";
import type { SyncSnapshot } from "@/types";
import type { Document } from "mongoose";

const SyncSnapshotSchema = new Schema<SyncSnapshot & Document>(
  {
    listingSyncLock: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastListingSyncedBlockNumber: {
      type: Number,
      required: true,
      default: 0,
    },
    collectibleSyncLock: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastCollectibleSyncedBlockNumber: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const SyncSnapshotModel =
  mongoose.models.SyncSnapshot || mongoose.model<SyncSnapshot>("SyncSnapshot", SyncSnapshotSchema);

export default SyncSnapshotModel;
