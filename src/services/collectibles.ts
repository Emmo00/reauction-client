import type { Collectible } from "@/types";
import CollectibleModel from "@/models/collectibles";

export class CollectibleService {
  static async createCollectible(collectibleData: Collectible): Promise<Collectible> {
    const collectible = new CollectibleModel(collectibleData);
    return await collectible.save();
  }

  static async getCollectibleByTokenId(tokenId: string): Promise<Collectible | null> {
    return await CollectibleModel.findOne({ tokenId });
  }

  static async getCollectiblesByOwner(
    owner: string,
    { limit, page }: { limit: number; page: number }
  ): Promise<Collectible[]> {
    const offset = page * limit;
    return await CollectibleModel.find({ owner }).limit(limit).skip(offset);
  }

  static async updateCollectible(
    tokenId: string,
    updateData: Partial<Collectible>
  ): Promise<Collectible | null> {
    return await CollectibleModel.findOneAndUpdate({ tokenId }, updateData, { new: true });
  }

  static async deleteCollectible(tokenId: string): Promise<boolean> {
    const result = await CollectibleModel.deleteOne({ tokenId });
    return result.deletedCount === 1;
  }

  static async collectibleExists(tokenId: string): Promise<boolean> {
    const collectible = await CollectibleModel.findOne({ tokenId });
    return collectible !== null;
  }

  static async countCollectiblesByOwner(owner: string): Promise<number> {
    return await CollectibleModel.countDocuments({ owner });
  }
}
