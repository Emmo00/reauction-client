import type { Waitlist } from "@/types";
import WaitlistModel from "@/models/waitlist";

export class WaitlistService {
  static async createWaitlistEntry(fid: string, username: string): Promise<Waitlist> {
    const waitlistEntry = new WaitlistModel({ fid, username });
    return await waitlistEntry.save();
  }

  static async getAllRecords(): Promise<Waitlist[]> {
    return await WaitlistModel.find({}).sort({ createdAt: -1 }).exec();
  }

  static async getCount(): Promise<number> {
    return await WaitlistModel.countDocuments({});
  }

  static async getAllowedCount(): Promise<number> {
    return await WaitlistModel.countDocuments({ allowed: true });
  }

  static async getNotAllowedCount(): Promise<number> {
    return await WaitlistModel.countDocuments({ allowed: false });
  }

  static async userExists(fid: string): Promise<boolean> {
    const user = await WaitlistModel.findOne({ fid });
    return user !== null;
  }

  static async updateAllowedStatus(fid: string, allowed: boolean): Promise<Waitlist | null> {
    return await WaitlistModel.findOneAndUpdate(
      { fid },
      { allowed },
      { new: true }
    );
  }
}