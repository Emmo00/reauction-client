import { NeynarAPIClient, Configuration, WebhookUserCreated } from "@neynar/nodejs-sdk";
import { APP_URL } from "./constants";

let neynarClient: NeynarAPIClient | null = null;

// Example usage:
// const client = getNeynarClient();
// const user = await client.lookupUserByFid(fid);
export function getNeynarClient() {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error("NEYNAR_API_KEY not configured");
    }
    const config = new Configuration({ apiKey });
    neynarClient = new NeynarAPIClient(config);
  }
  return neynarClient;
}

type User = WebhookUserCreated["data"];

export async function getNeynarUser(fid: number): Promise<User | null> {
  try {
    const client = getNeynarClient();
    const usersResponse = await client.fetchBulkUsers({ fids: [fid] });
    return usersResponse.users[0];
  } catch (error) {
    console.error("Error getting Neynar user:", error);
    return null;
  }
}

type SendMiniAppNotificationResult =
  | {
      state: "error";
      error: unknown;
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export async function sendNeynarMiniAppNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendMiniAppNotificationResult> {
  try {
    const client = getNeynarClient();
    const targetFids = [fid];
    const notification = {
      title,
      body,
      target_url: APP_URL,
    };

    const result = await client.publishFrameNotifications({
      targetFids,
      notification,
    });

    if (result.notification_deliveries.length > 0) {
      return { state: "success" };
    } else if (result.notification_deliveries.length === 0) {
      return { state: "no_token" };
    } else {
      return { state: "error", error: result || "Unknown error" };
    }
  } catch (error) {
    return { state: "error", error };
  }
}

export async function getFarcasterCastByHash(castHash: string) {
  try {
    const client = getNeynarClient();

    console.log("Fetching Farcaster cast for hash:", castHash);
    
    const cast = await client.lookupCastByHashOrUrl({
      identifier: castHash,
      type: "hash",
    });

    return cast;
  } catch (error) {
    console.error("Error fetching Farcaster cast:", error);
    return null;
  }
}

export async function getFarcasterUserByWalletAddress(address: string) {
  try {
    const client = getNeynarClient();

    const response = await client.fetchBulkUsersByEthOrSolAddress({ addresses: [address] });

    // Response structure: { "address": [user1, user2, ...] }
    // Get the first address's user array and return the first user
    const addressKey = Object.keys(response)[0];
    if (addressKey && response[addressKey] && response[addressKey].length > 0) {
      return response[addressKey][0]; // Return first user for the first address
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching Farcaster user by wallet address:", error);
    return null;
  }
}
