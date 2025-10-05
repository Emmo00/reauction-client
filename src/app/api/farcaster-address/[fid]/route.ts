import { NextRequest, NextResponse } from 'next/server';

interface FarcasterUser {
  fid: number;
  custody_address: string;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const { fid } = params;
    
    // Validate FID
    const fidNumber = parseInt(fid);
    if (isNaN(fidNumber) || fidNumber <= 0) {
      return NextResponse.json(
        { error: 'Invalid FID' },
        { status: 400 }
      );
    }

    // Try to get verified address from Farcaster API first
    try {
      const farcasterResponse = await fetch(
        `https://api.farcaster.xyz/fc/primary-address?fid=${fidNumber}&protocol=ethereum`
      );
      
      if (farcasterResponse.ok) {
        const farcasterData = await farcasterResponse.json();
        if (farcasterData?.result?.address?.address) {
          return NextResponse.json({
            fid: fidNumber,
            address: farcasterData.result.address.address,
            source: 'farcaster_primary'
          });
        }
      }
    } catch (error) {
      console.warn('Farcaster API failed, trying Neynar...', error);
    }

    // Fallback to Neynar API if available
    if (process.env.NEYNAR_API_KEY) {
      try {
        const neynarResponse = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidNumber}`,
          {
            headers: {
              'accept': 'application/json',
              'api_key': process.env.NEYNAR_API_KEY,
            },
          }
        );

        if (neynarResponse.ok) {
          const neynarData = await neynarResponse.json();
          const user = neynarData?.users?.[0];
          
          if (user) {
            // Try verified ETH addresses first
            if (user.verified_addresses?.eth_addresses?.length > 0) {
              return NextResponse.json({
                fid: fidNumber,
                address: user.verified_addresses.eth_addresses[0],
                source: 'neynar_verified'
              });
            }
            
            // Fallback to custody address
            if (user.custody_address) {
              return NextResponse.json({
                fid: fidNumber,
                address: user.custody_address,
                source: 'neynar_custody'
              });
            }
          }
        }
      } catch (error) {
        console.warn('Neynar API failed...', error);
      }
    }

    // If all APIs fail, return an error
    return NextResponse.json(
      { error: 'Unable to find wallet address for this FID' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}