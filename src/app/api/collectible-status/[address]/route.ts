import { NextRequest, NextResponse } from 'next/server';
import { getAddress, isAddress } from 'viem';

// CoinbaSeQL SQL API configuration
const SQL_API_URL = 'https://api.cdp.coinbase.com/platform/v2/data/query/run';
const CDP_CLIENT_TOKEN = process.env.CDP_CLIENT_TOKEN;

if (!CDP_CLIENT_TOKEN) {
  console.warn('CDP_CLIENT_TOKEN not found in environment variables');
}

interface CollectibleStatus {
  address: string;
  castsCollected: number;
  castsBeingSold: number;
  castsSold: number;
}

interface SqlApiResponse {
  result: Array<{
    event_name: string;
    parameters: {
      creator?: string;
      winner?: string;
      tokenId?: string;
      listingId?: string;
      auctionId?: string;
    };
    block_timestamp: string;
  }>;
}

/**
 * Execute a SQL query using CoinbaSeQL API
 */
async function executeQuery(sql: string): Promise<SqlApiResponse> {
  if (!CDP_CLIENT_TOKEN) {
    throw new Error('CDP_CLIENT_TOKEN is required but not configured');
  }

  const response = await fetch(SQL_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CDP_CLIENT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SQL API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    // Validate address format
    if (!isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const checksumAddress = getAddress(address);
    const lowerAddress = checksumAddress.toLowerCase(); // CoinbaSeQL stores addresses in lowercase
    
    console.log('Fetching collectible status for address:', checksumAddress);

    // Query for auction and listing events related to this creator
    const eventsQuery = `
      SELECT 
        event_name,
        parameters,
        block_timestamp
      FROM base.events
      WHERE address = '0x3af2fc5ed9c3da8f669e34fd6aba5a87afc933ae'
        AND (
          (event_name = 'ListingCreated' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'AuctionStarted' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'ListingPurchased' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'AuctionSettled' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'ListingCancelled' AND parameters['creator'] = '${lowerAddress}') OR
          (event_name = 'AuctionCancelled' AND parameters['creator'] = '${lowerAddress}')
        )
      ORDER BY block_timestamp DESC
    `;

    // Execute the query
    const eventsResult = await executeQuery(eventsQuery);

    // For now, we'll set castsCollected to 0 since we need the collectible contract address
    // This can be enhanced once we know the specific collectible contract address
    const castsCollected = 0;

    // Process events to calculate stats
    let castsBeingSold = 0;
    let castsSold = 0;
    
    // Track active listings and auctions
    const activeListings = new Set<string>();
    const activeAuctions = new Set<string>();
    
    // Process events chronologically (oldest first)
    const events = eventsResult.result.reverse();
    
    for (const event of events) {
      const { event_name, parameters } = event;
      
      switch (event_name) {
        case 'ListingCreated':
          if (parameters.listingId) {
            activeListings.add(parameters.listingId);
          }
          break;
          
        case 'AuctionStarted':
          if (parameters.auctionId) {
            activeAuctions.add(parameters.auctionId);
          }
          break;
          
        case 'ListingPurchased':
          if (parameters.listingId) {
            activeListings.delete(parameters.listingId);
            castsSold++;
          }
          break;
          
        case 'AuctionSettled':
          if (parameters.auctionId) {
            activeAuctions.delete(parameters.auctionId);
            if (parameters.winner && parameters.winner !== '0x0000000000000000000000000000000000000000') {
              castsSold++;
            }
          }
          break;
          
        case 'ListingCancelled':
          if (parameters.listingId) {
            activeListings.delete(parameters.listingId);
          }
          break;
          
        case 'AuctionCancelled':
          if (parameters.auctionId) {
            activeAuctions.delete(parameters.auctionId);
          }
          break;
      }
    }
    
    // Active listings and auctions are casts being sold
    castsBeingSold = activeListings.size + activeAuctions.size;

    const collectibleStatus: CollectibleStatus = {
      address: checksumAddress,
      castsCollected: Number(castsCollected),
      castsBeingSold,
      castsSold,
    };

    console.log('Collectible status result:', collectibleStatus);

    return NextResponse.json(collectibleStatus);

  } catch (error) {
    console.error('Error fetching collectible status:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch collectible status",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

