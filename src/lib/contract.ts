import { getAuctionContractAddress, getPublicClient } from "./constants";
import auctionAbi from "@/abis/auction.json";
import { AuctionData, ListingData } from "@/types";

/**
 * Fetches auction data from the smart contract
 * @param auctionId - The auction ID to fetch
 * @returns Promise<AuctionData> - The auction data from the contract
 */
export async function fetchAuctionFromContract(auctionId: string): Promise<AuctionData> {
  try {
    const publicClient = getPublicClient();
    const contractAddress = getAuctionContractAddress();

    const result = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: auctionAbi,
      functionName: "getAuction",
      args: [BigInt(auctionId)],
    })) as [string, bigint, string, bigint, bigint, number, bigint, number, number];

    // Destructure the tuple result based on the ABI structure
    const [
      creator,
      tokenId,
      highestBidder,
      highestBid,
      endTime,
      bids,
      extension,
      protocolFeeBps,
      state,
    ] = result;

    return {
      creator,
      tokenId,
      highestBidder,
      highestBid,
      endTime,
      bids,
      extension,
      protocolFeeBps,
      state,
    };
  } catch (error) {
    console.error("Error fetching auction from contract:", error);
    throw new Error(`Failed to fetch auction ${auctionId}: ${error}`);
  }
}

/**
 * Fetches fixed-price listing data from the smart contract
 * @param listingId - The listing ID to fetch
 * @returns Promise<ListingData> - The listing data from the contract
 */
export async function fetchFixedPriceFromContract(listingId: string): Promise<ListingData> {
  try {
    const publicClient = getPublicClient();
    const contractAddress = getAuctionContractAddress();

    const result = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: auctionAbi,
      functionName: "getListing",
      args: [BigInt(listingId)],
    })) as [string, string, bigint, bigint, bigint, bigint, number, number];

    // Destructure the tuple result based on the ABI structure
    const [creator, buyer, price, tokenId, createdAt, endTime, protocolFeeBps, state] = result;

    return {
      creator,
      buyer,
      price,
      tokenId,
      createdAt,
      endTime,
      protocolFeeBps,
      state,
    };
  } catch (error) {
    console.error("Error fetching listing from contract:", error);
    throw new Error(`Failed to fetch listing ${listingId}: ${error}`);
  }
}
