"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { waitlistAPI } from "@/lib/api/waitlist";

interface Props {
  setJoinWaitlistFailed: (error: string, onRetry: () => Promise<boolean>, isRetrying: boolean) => void;
  setJoinWaitlistSuccess: () => void;
}

export default function JoinWaitlistButton({
  setJoinWaitlistFailed,
  setJoinWaitlistSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    context,
    actions: { addMiniApp },
  } = useMiniApp();

  const handleJoinWaitlist = async () => {
    setIsLoading(true);

    // wait 2 seconds
    console.log('before wait');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('after wait');
    
    try {
      const addMiniAppResult = await addMiniApp();

      if (!addMiniAppResult.notificationDetails?.token) {
        throw new Error("Failed to add Mini App");
      }

      if (context)
        await waitlistAPI.joinWaitlist({
          fid: context.user.fid!.toString(),
          username: context.user.username!,
        });
      else throw new Error("Not Within Mini App Context");
      setJoinWaitlistSuccess();
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error joining waitlist:", error);
      setJoinWaitlistFailed(
        error instanceof Error ? error.message : "Unknown error",
        handleJoinWaitlist, isLoading
      );
      setIsLoading(false);
      return false;
    }
  };

  return (
    <Button
      size="lg"
      className="h-12 rounded-full px-8 text-base font-semibold"
      onClick={handleJoinWaitlist}
    >
      {isLoading ? "Joining..." : "Join Waitlist"}{" "}
      <ChevronRight className={`ml-2 h-4 w-4 ${isLoading ? "animate-pulse " : ""}`} />
      <ChevronRight className={`h-4 w-4 ${isLoading ? "animate-pulse " : ""}`} />
      <ChevronRight className={`h-4 w-4 ${isLoading ? "animate-pulse " : ""}`} />
    </Button>
  );
}
