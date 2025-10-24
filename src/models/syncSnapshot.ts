import mongoose, { Schema } from "mongoose";
import type { SyncSnapshot } from "@/types";

const SyncSnapshotSchema = new Schema<SyncSnapshot>(
  {
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
