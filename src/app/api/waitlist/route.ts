import { NextRequest, NextResponse } from "next/server";
import { WaitlistService } from "@/services/waitlist";
import connectToDatabase from "@/lib/mongodb";
import { sendNeynarMiniAppNotification } from "@/lib/neynar";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { fid, username } = body;

    if (!fid || !username) {
      return NextResponse.json({ error: "fid and username are required" }, { status: 400 });
    }

    // Check if user already exists
    const userExists = await WaitlistService.userExists(fid);
    if (userExists) {
      return NextResponse.json({ error: "User already exists in waitlist" }, { status: 409 });
    }

    const waitlistEntry = await WaitlistService.createWaitlistEntry(fid, username);

    console.log(`Added user ${username} (fid: ${fid}) to waitlist`);

    // send notification to the user
    const notResult = await sendNeynarMiniAppNotification({
      fid: parseInt(fid, 10),
      title: "You're In!", // 32 chars max
      body: `Hello ${username}, you're now on our waitlist!`, // 128 chars max
    });

    console.log("Neynar notification result:", notResult);

    return NextResponse.json(
      {
        message: "User added to waitlist successfully",
        entry: waitlistEntry,
        notification: notResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user to waitlist:", error);
    return NextResponse.json({ error: "Failed to add user to waitlist" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const action = searchParams.get("action");

    switch (action) {
      case "all":
        const allRecords = await WaitlistService.getAllRecords();
        return NextResponse.json({ records: allRecords });

      case "count":
        const count = await WaitlistService.getCount();
        return NextResponse.json({ count });

      case "allowed-count":
        const allowedCount = await WaitlistService.getAllowedCount();
        return NextResponse.json({ count: allowedCount });

      case "not-allowed-count":
        const notAllowedCount = await WaitlistService.getNotAllowedCount();
        return NextResponse.json({ count: notAllowedCount });

      case "stats":
        const [totalCount, allowedCountStats, notAllowedCountStats] = await Promise.all([
          WaitlistService.getCount(),
          WaitlistService.getAllowedCount(),
          WaitlistService.getNotAllowedCount(),
        ]);

        return NextResponse.json({
          total: totalCount,
          allowed: allowedCountStats,
          notAllowed: notAllowedCountStats,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: all, count, allowed-count, not-allowed-count, or stats" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching waitlist data:", error);
    return NextResponse.json({ error: "Failed to fetch waitlist data" }, { status: 500 });
  }
}
