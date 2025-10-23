import mongoose, { Schema } from "mongoose";
import type { Cache } from "@/types";

const CacheSchema = new Schema<Cache>({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    expires: 0, // MongoDB TTL index - documents will be automatically deleted when expiresAt is reached
  },
});

// Create compound index for efficient queries
CacheSchema.index({ key: 1, expiresAt: 1 });

const CacheModel = mongoose.models.Cache || mongoose.model<Cache>("Cache", CacheSchema);

export default CacheModel;
