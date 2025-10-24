import type { SyncSnapshot } from "@/types";
import SyncSnapshotModel from "@/models/syncSnapshot";

export class SyncSnapshotService {
  static async getSnapshot(): Promise<SyncSnapshot | null> {
    return await SyncSnapshotModel.findOne();
  }

  static async updateSnapshot(snapshotData: Partial<SyncSnapshot>): Promise<SyncSnapshot | null> {
    return await SyncSnapshotModel.findOneAndUpdate({}, snapshotData, { new: true, upsert: true });
  }

  static async lockSync(): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ syncLock: true });
  }

  static async unlockSync(): Promise<SyncSnapshot | null> {
    return await this.updateSnapshot({ syncLock: false });
  }
}

const syncSnapshotService = new SyncSnapshotService();
export default syncSnapshotService;
