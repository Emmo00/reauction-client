import { NextRequest, NextResponse } from "next/server";
import { getFarcasterCastByHash } from "@/lib/neynar";

export async function GET(_: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  try {
    const { hash } = await params;
    console.log(`Fetching collectible with hash: ${hash}`);

    const cast = await getFarcasterCastByHash(hash);

    if (!cast) {
      return NextResponse.json({ error: "Collectible not found" }, { status: 404 });
    }

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error("Error fetching collectible:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
