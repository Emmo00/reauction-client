import type { SyncSnapshot } from "@/types";
import SyncSnapshotModel from "@/models/syncSnapshot";

export class SyncSnapshotService {
  static async getSnapshot(): Promise<SyncSnapshot | null> {
    return await SyncSnapshotModel.findOne();
  }

  static async updateSnapshot(snapshotData: Partial<SyncSnapshot>): Promise<SyncSnapshot | null> {
    return await SyncSnapshotModel.findOneAndUpdate({}, snapshotData, { new: true, upsert: true });
  }
}
