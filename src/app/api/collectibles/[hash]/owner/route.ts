import { NextRequest, NextResponse } from "next/server";
import { getFarcasterUserByWalletAddress } from "@/lib/neynar";
import { getPublicClient } from "@/lib/constants";
import collectibleAbi from "@/abis/collectible.json";
import { getContract } from "viem";
import { getAuctionContractAddress } from "@/lib/constants";

export async function GET(_: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  try {
    const { hash } = await params;

    const tokenId = BigInt(hash);

    const client = getPublicClient();

    // Get the collectible contract
    const collectibleContract = getContract({
      address: getAuctionContractAddress() as `0x${string}`,
      abi: collectibleAbi,
      client,
    });

    // Fetch the owner of the collectible
    const address = (await collectibleContract.read.ownerOf([tokenId])) as `0x${string}`;

    if (!address || address === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json({ error: "Collectible not found" }, { status: 404 });
    }

    const user = await getFarcasterUserByWalletAddress(address);

    if (!user) {
      return NextResponse.json({ address, found_on_farcaster: false });
    }

    return NextResponse.json({ ...user, found_on_farcaster: true });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
