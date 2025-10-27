import mongoose, { Schema } from "mongoose";
import type { Collectible } from "@/types";
import type { Document } from "mongoose";

const CollectibleSchema = new Schema<Collectible & Document>(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: String,
      required: true,
    },
    cast: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

CollectibleSchema.index({ tokenId: 1, owner: 1 });

export const CollectibleModel =
  mongoose.models.Collectible ||
  mongoose.model<Collectible & Document>("Collectible", CollectibleSchema);

export default CollectibleModel;
