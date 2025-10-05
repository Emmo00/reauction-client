import dbConnect from '@/lib/mongodb';
import SyncStatus from '@/models/SyncStatus';
import ListingCreated from '@/models/ListingCreated';
import AuctionStarted from '@/models/AuctionStarted';
import ListingPurchased from '@/models/ListingPurchased';
import AuctionSettled from '@/models/AuctionSettled';
import ListingCancelled from '@/models/ListingCancelled';
import AuctionCancelled from '@/models/AuctionCancelled';
import { AUCTION_CONTRACT_ADDRESS } from '@/lib/constants';

export class ContractSyncService {
  private static readonly START_BLOCK = '31958959';
  private static readonly MAX_BLOCK_RANGE = 2000;

  /**
   * Get or create sync status for the contract
   */
  static async getSyncStatus(chainId: number) {
    await dbConnect();
    
    let syncStatus = await SyncStatus.findOne({
      contractAddress: AUCTION_CONTRACT_ADDRESS,
      chainId,
    });

    if (!syncStatus) {
      syncStatus = new SyncStatus({
        contractAddress: AUCTION_CONTRACT_ADDRESS,
        chainId,
        lastSyncedBlock: this.START_BLOCK,
        startBlock: this.START_BLOCK,
        isInitialized: false,
      });
      await syncStatus.save();
    }

    return syncStatus;
  }

  /**
   * Update sync status
   */
  static async updateSyncStatus(chainId: number, lastSyncedBlock: string, isInitialized = true) {
    await dbConnect();
    
    await SyncStatus.findOneAndUpdate(
      {
        contractAddress: AUCTION_CONTRACT_ADDRESS,
        chainId,
      },
      {
        lastSyncedBlock,
        isInitialized,
        lastUpdated: new Date(),
      },
      { upsert: true }
    );
  }

  /**
   * Sync contract events from last synced block to current block
   */
  static async syncToCurrentBlock(publicClient: any, chainId: number) {
    console.log(`Starting sync for chain ${chainId}`);
    
    const syncStatus = await this.getSyncStatus(chainId);
    const currentBlock = await publicClient.getBlockNumber();
    const lastSyncedBlock = BigInt(syncStatus.lastSyncedBlock);
    
    console.log(`Last synced: ${lastSyncedBlock}, Current: ${currentBlock}`);
    
    if (lastSyncedBlock >= currentBlock) {
      console.log('Already up to date');
      return;
    }

    // Sync in chunks
    let fromBlock = lastSyncedBlock + 1n;
    
    while (fromBlock <= currentBlock) {
      const toBlock = fromBlock + BigInt(this.MAX_BLOCK_RANGE - 1) > currentBlock 
        ? currentBlock 
        : fromBlock + BigInt(this.MAX_BLOCK_RANGE - 1);
      
      console.log(`Syncing blocks ${fromBlock} to ${toBlock}`);
      
      try {
        await this.syncBlockRange(publicClient, chainId, fromBlock, toBlock);
        await this.updateSyncStatus(chainId, toBlock.toString(), true);
        
        fromBlock = toBlock + 1n;
      } catch (error) {
        console.error(`Error syncing blocks ${fromBlock} to ${toBlock}:`, error);
        
        // Try to continue with smaller chunks if we hit an error
        if (toBlock - fromBlock > 100n) {
          const smallerToBlock = fromBlock + 100n;
          console.log(`Retrying with smaller chunk: blocks ${fromBlock} to ${smallerToBlock}`);
          try {
            await this.syncBlockRange(publicClient, chainId, fromBlock, smallerToBlock);
            await this.updateSyncStatus(chainId, smallerToBlock.toString(), true);
            fromBlock = smallerToBlock + 1n;
            continue;
          } catch (retryError) {
            console.error(`Retry also failed for blocks ${fromBlock} to ${smallerToBlock}:`, retryError);
          }
        }
        
        // Skip this problematic block range and continue
        console.warn(`Skipping problematic block range ${fromBlock} to ${toBlock}`);
        fromBlock = toBlock + 1n;
      }
    }
    
    console.log(`Sync completed for chain ${chainId}`);
  }

  /**
   * Sync events for a specific block range
   */
  static async syncBlockRange(publicClient: any, chainId: number, fromBlock: bigint, toBlock: bigint) {
    const contractAddress = AUCTION_CONTRACT_ADDRESS as `0x${string}`;
    
    // Helper function to safely get logs with error handling
    const safeGetLogs = async (eventConfig: any) => {
      try {
        const logs = await publicClient.getLogs({
          address: contractAddress,
          ...eventConfig,
          fromBlock,
          toBlock,
        });
        return Array.isArray(logs) ? logs : [];
      } catch (error) {
        console.warn(`Failed to fetch logs for event ${eventConfig.event?.name}:`, error);
        return [];
      }
    };
    
    // Fetch all event types in parallel with error handling
    const [
      listingCreatedLogs,
      auctionStartedLogs,
      listingPurchasedLogs,
      auctionSettledLogs,
      listingCancelledLogs,
      auctionCancelledLogs,
    ] = await Promise.all([
      // ListingCreated events
      safeGetLogs({
        event: {
          type: 'event',
          name: 'ListingCreated',
          inputs: [
            { name: 'listingId', type: 'uint256', indexed: true },
            { name: 'creator', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true },
            { name: 'price', type: 'uint256', indexed: false },
          ],
        },
      }),
      
      // AuctionStarted events
      safeGetLogs({
        event: {
          type: 'event',
          name: 'AuctionStarted',
          inputs: [
            { name: 'auctionId', type: 'uint256', indexed: true },
            { name: 'creator', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true },
            { name: 'startAsk', type: 'uint256', indexed: false },
            { name: 'duration', type: 'uint256', indexed: false },
          ],
        },
      }),
      
      // ListingPurchased events
      safeGetLogs({
        event: {
          type: 'event',
          name: 'ListingPurchased',
          inputs: [
            { name: 'listingId', type: 'uint256', indexed: true },
            { name: 'buyer', type: 'address', indexed: true },
            { name: 'creator', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: false },
            { name: 'price', type: 'uint256', indexed: false },
          ],
        },
      }),
      
      // AuctionSettled events
      safeGetLogs({
        event: {
          type: 'event',
          name: 'AuctionSettled',
          inputs: [
            { name: 'auctionId', type: 'uint256', indexed: true },
            { name: 'creator', type: 'address', indexed: true },
            { name: 'winner', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: false },
            { name: 'finalBid', type: 'uint256', indexed: false },
          ],
        },
      }),
      
      // ListingCancelled events
      safeGetLogs({
        event: {
          type: 'event',
          name: 'ListingCancelled',
          inputs: [
            { name: 'listingId', type: 'uint256', indexed: true },
            { name: 'creator', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: false },
          ],
        },
      }),
      
      // AuctionCancelled events
      safeGetLogs({
        event: {
          type: 'event',
          name: 'AuctionCancelled',
          inputs: [
            { name: 'auctionId', type: 'uint256', indexed: true },
            { name: 'creator', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: false },
          ],
        },
      }),
    ]);

    // Store events in database
    await this.storeEvents(chainId, {
      listingCreated: listingCreatedLogs,
      auctionStarted: auctionStartedLogs,
      listingPurchased: listingPurchasedLogs,
      auctionSettled: auctionSettledLogs,
      listingCancelled: listingCancelledLogs,
      auctionCancelled: auctionCancelledLogs,
    });
  }

  /**
   * Store events in the database
   */
  static async storeEvents(chainId: number, events: {
    listingCreated: any[];
    auctionStarted: any[];
    listingPurchased: any[];
    auctionSettled: any[];
    listingCancelled: any[];
    auctionCancelled: any[];
  }) {
    await dbConnect();

    // Ensure all event arrays are valid before processing
    const safeEvents = {
      listingCreated: Array.isArray(events.listingCreated) ? events.listingCreated : [],
      auctionStarted: Array.isArray(events.auctionStarted) ? events.auctionStarted : [],
      listingPurchased: Array.isArray(events.listingPurchased) ? events.listingPurchased : [],
      auctionSettled: Array.isArray(events.auctionSettled) ? events.auctionSettled : [],
      listingCancelled: Array.isArray(events.listingCancelled) ? events.listingCancelled : [],
      auctionCancelled: Array.isArray(events.auctionCancelled) ? events.auctionCancelled : [],
    };

    // Check if we have any events to process
    const totalEvents = Object.values(safeEvents).reduce((total, events) => total + events.length, 0);
    if (totalEvents === 0) {
      console.log(`No events found in this batch`);
      return;
    }

    console.log(`Processing ${totalEvents} total events`);

    // Process ListingCreated events
    for (const log of safeEvents.listingCreated) {
      try {
        await ListingCreated.findOneAndUpdate(
          {
            chainId,
            blockNumber: log.blockNumber.toString(),
            logIndex: log.logIndex,
          },
          {
            listingId: log.args.listingId.toString(),
            creator: log.args.creator.toLowerCase(),
            tokenId: log.args.tokenId.toString(),
            price: log.args.price.toString(),
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            chainId,
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error storing ListingCreated event:', error);
      }
    }

    // Process AuctionStarted events
    for (const log of safeEvents.auctionStarted) {
      try {
        await AuctionStarted.findOneAndUpdate(
          {
            chainId,
            blockNumber: log.blockNumber.toString(),
            logIndex: log.logIndex,
          },
          {
            auctionId: log.args.auctionId.toString(),
            creator: log.args.creator.toLowerCase(),
            tokenId: log.args.tokenId.toString(),
            startAsk: log.args.startAsk.toString(),
            duration: log.args.duration.toString(),
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            chainId,
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error storing AuctionStarted event:', error);
      }
    }

    // Process ListingPurchased events
    for (const log of safeEvents.listingPurchased) {
      try {
        await ListingPurchased.findOneAndUpdate(
          {
            chainId,
            blockNumber: log.blockNumber.toString(),
            logIndex: log.logIndex,
          },
          {
            listingId: log.args.listingId.toString(),
            buyer: log.args.buyer.toLowerCase(),
            creator: log.args.creator.toLowerCase(),
            tokenId: log.args.tokenId.toString(),
            price: log.args.price.toString(),
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            chainId,
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error storing ListingPurchased event:', error);
      }
    }

    // Process AuctionSettled events
    for (const log of safeEvents.auctionSettled) {
      try {
        await AuctionSettled.findOneAndUpdate(
          {
            chainId,
            blockNumber: log.blockNumber.toString(),
            logIndex: log.logIndex,
          },
          {
            auctionId: log.args.auctionId.toString(),
            creator: log.args.creator.toLowerCase(),
            winner: log.args.winner.toLowerCase(),
            tokenId: log.args.tokenId.toString(),
            finalBid: log.args.finalBid.toString(),
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            chainId,
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error storing AuctionSettled event:', error);
      }
    }

    // Process ListingCancelled events
    for (const log of safeEvents.listingCancelled) {
      try {
        await ListingCancelled.findOneAndUpdate(
          {
            chainId,
            blockNumber: log.blockNumber.toString(),
            logIndex: log.logIndex,
          },
          {
            listingId: log.args.listingId.toString(),
            creator: log.args.creator.toLowerCase(),
            tokenId: log.args.tokenId.toString(),
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            chainId,
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error storing ListingCancelled event:', error);
      }
    }

    // Process AuctionCancelled events
    for (const log of safeEvents.auctionCancelled) {
      try {
        await AuctionCancelled.findOneAndUpdate(
          {
            chainId,
            blockNumber: log.blockNumber.toString(),
            logIndex: log.logIndex,
          },
          {
            auctionId: log.args.auctionId.toString(),
            creator: log.args.creator.toLowerCase(),
            tokenId: log.args.tokenId.toString(),
            blockNumber: log.blockNumber.toString(),
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            chainId,
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error storing AuctionCancelled event:', error);
      }
    }
  }

  /**
   * Query events for a specific creator
   */
  static async getCreatorEvents(chainId: number, creatorAddress: string) {
    await dbConnect();
    
    const [
      listingCreated,
      auctionStarted,
      listingPurchased,
      auctionSettled,
      listingCancelled,
      auctionCancelled,
    ] = await Promise.all([
      ListingCreated.find({ chainId, creator: creatorAddress.toLowerCase() }),
      AuctionStarted.find({ chainId, creator: creatorAddress.toLowerCase() }),
      ListingPurchased.find({ chainId, creator: creatorAddress.toLowerCase() }),
      AuctionSettled.find({ chainId, creator: creatorAddress.toLowerCase() }),
      ListingCancelled.find({ chainId, creator: creatorAddress.toLowerCase() }),
      AuctionCancelled.find({ chainId, creator: creatorAddress.toLowerCase() }),
    ]);

    return {
      listingCreated,
      auctionStarted,
      listingPurchased,
      auctionSettled,
      listingCancelled,
      auctionCancelled,
    };
  }
}