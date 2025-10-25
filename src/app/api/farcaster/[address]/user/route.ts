import { NextRequest, NextResponse } from "next/server";
import { getFarcasterUserByWalletAddress } from "@/lib/neynar";

export async function GET(_: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    const user = await getFarcasterUserByWalletAddress(address);

    if (!user) {
      return NextResponse.json({ error: "User not found", address }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user by address:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
