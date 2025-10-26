import type { SyncSnapshot } from "@/types";
import SyncSnapshotModel from "@/models/syncSnapshot";

export class SyncSnapshotService {
  static async getSnapshot(): Promise<SyncSnapshot | null> {
    return await SyncSnapshotModel.findOne();
  }

  static async updateSnapshot(snapshotData: Partial<SyncSnapshot>): Promise<SyncSnapshot | null> {
    return await SyncSnapshotModel.findOneAndUpdate({}, snapshotData, { new: true, upsert: true });
  }

  static async updateLastListingSyncedBlockNumber(
    blockNumber: number
  ): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ lastListingSyncedBlockNumber: blockNumber });
  }

  static async updateLastCollectibleSyncedBlockNumber(
    blockNumber: number
  ): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ lastCollectibleSyncedBlockNumber: blockNumber });
  }

  static async lockListingSync(): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ listingSyncLock: true });
  }

  static async lockCollectibleSync(): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ collectibleSyncLock: true });
  }

  static async unlockListingSync(): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ listingSyncLock: false });
  }

  static async unlockCollectibleSync(): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ collectibleSyncLock: false });
  }
}

const syncSnapshotService = new SyncSnapshotService();
export default syncSnapshotService;
