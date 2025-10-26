import auctionabi from "@/abis/auction.json";
import collectibleabi from "@/abis/collectible.json";
import { ParsedEvent } from "@/types";
import "dotenv/config";
import { parseEventLogs, RpcLog } from "viem";
import { getChain } from "@/lib/constants";

const BASE_URL = "https://api.etherscan.io/api";
const API_KEY = process.env.ETHERSCAN_API_KEY || "";

if (!API_KEY) {
  throw new Error("ETHERSCAN_API_KEY is not set. Etherscan API requests will fail.");
}

export async function fetchEtherscanData(
  module: string,
  action: string,
  params: Record<string, string> = {}
) {
  const url = new URL(BASE_URL);
  url.searchParams.append("module", module);
  url.searchParams.append("action", action);
  url.searchParams.append("apikey", API_KEY);
  url.searchParams.append("chain", getChain().id.toString());

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch Etherscan data: ${response.statusText}`);
  }

  return response.json();
}

export async function getContractEvents(
  address: string,
  fromBlock: number | null = null,
  toBlock: number | null = null
) {
  const options = {
    fromBlock: fromBlock ? fromBlock.toString() : "null",
    toBlock: toBlock ? toBlock.toString() : "null",
    address,
  };

  return fetchEtherscanData("logs", "getLogs", options);
}

export async function getTransactionReceipt(txHash: string) {
  return fetchEtherscanData("proxy", "eth_getTransactionReceipt", {
    txhash: txHash,
  });
}

export function decodeEvent(
  contract: "auction" | "collectible",
  eventData: RpcLog[]
): ParsedEvent[] {
  const abi = contract === "auction" ? auctionabi : collectibleabi;

  const parsedLogs = parseEventLogs({
    abi: abi,
    logs: eventData,
  }) as unknown as ParsedEvent[];

  return parsedLogs;
}
