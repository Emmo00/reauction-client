import { CollectibleStatus, SqlApiResponse } from "@/types/collectible-status";
// CoinbaSeQL SQL API configuration
const SQL_API_URL = "https://api.cdp.coinbase.com/platform/v2/data/query/run";
const CDP_CLIENT_TOKEN = process.env.CDP_CLIENT_TOKEN;

if (!CDP_CLIENT_TOKEN) {
  console.warn("CDP_CLIENT_TOKEN not found in environment variables");
}

/**
 * Execute a SQL query using CoinbaSeQL API
 */
export async function executeCoinbaseqlQuery(sql: string): Promise<SqlApiResponse> {
  if (!CDP_CLIENT_TOKEN) {
    throw new Error("CDP_CLIENT_TOKEN is required but not configured");
  }

  const response = await fetch(SQL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CDP_CLIENT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `SQL API request failed: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return response.json();
}
