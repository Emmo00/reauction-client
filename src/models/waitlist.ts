import mongoose, { Schema } from "mongoose";
import type { Waitlist } from "@/types";
import type { Document } from "mongoose";

const WaitlistSchema = new Schema<Waitlist & Document>(
  {
    fid: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    allowed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// Create index for efficient queries
WaitlistSchema.index({ fid: 1 });
WaitlistSchema.index({ allowed: 1 });

const WaitlistModel = mongoose.models.Waitlist || mongoose.model<Waitlist>("Waitlist", WaitlistSchema);

export default WaitlistModel;