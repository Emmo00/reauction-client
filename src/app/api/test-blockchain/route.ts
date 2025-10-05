import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { AUCTION_CONTRACT_ADDRESS, BASE_RPC_URL, BASE_SEPOLIA_RPC_URL } from '@/lib/constants';

export async function GET() {
  try {
    // Determine which chain to use based on environment
    const chain = process.env.NODE_ENV === 'production' ? base : baseSepolia;
    const rpcUrl = process.env.NODE_ENV === 'production' ? BASE_RPC_URL : BASE_SEPOLIA_RPC_URL;

    // Create public client for blockchain interactions
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Test blockchain connection
    const blockNumber = await publicClient.getBlockNumber();
    
    return NextResponse.json({
      success: true,
      network: process.env.NODE_ENV === 'production' ? 'Base Mainnet' : 'Base Sepolia',
      rpcUrl,
      auctionContract: AUCTION_CONTRACT_ADDRESS,
      currentBlock: blockNumber.toString(),
    });

  } catch (error) {
    console.error('Blockchain test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        network: process.env.NODE_ENV === 'production' ? 'Base Mainnet' : 'Base Sepolia',
        rpcUrl: process.env.NODE_ENV === 'production' ? BASE_RPC_URL : BASE_SEPOLIA_RPC_URL,
        auctionContract: AUCTION_CONTRACT_ADDRESS,
      },
      { status: 500 }
    );
  }
}