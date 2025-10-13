import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { GenericCacheService } from "@/lib/cache/generic-cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');

    // Connect to MongoDB
    await connectToDatabase();

    // Get cache statistics
    const stats = await GenericCacheService.getStats();

    return NextResponse.json({
      stats,
      message: pattern ? `Stats for pattern: ${pattern}` : "Global cache statistics"
    });

  } catch (error) {
    console.error("Error getting cache stats:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to get cache stats" 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');

    // Connect to MongoDB
    await connectToDatabase();

    // Clear cache based on pattern or all
    await GenericCacheService.clear(pattern || undefined);

    return NextResponse.json({ 
      success: true, 
      message: pattern ? `Cache cleared for pattern: ${pattern}` : "All cache cleared" 
    });

  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to clear cache" 
      }, 
      { status: 500 }
    );
  }
}