import mongoose, { Schema } from "mongoose";
import type { SyncSnapshot } from "@/types";
import type { Document } from "mongoose";

const SyncSnapshotSchema = new Schema<SyncSnapshot & Document>(
  {
    syncLock: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastSyncedBlockTimeStamp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SyncSnapshotModel =
  mongoose.models.SyncSnapshot || mongoose.model<SyncSnapshot>("SyncSnapshot", SyncSnapshotSchema);

export default SyncSnapshotModel;
