"use client";

import FaultyTerminal from "@/components/FaultyTerminal";
import { Button } from "@/components/ui/button";
import { useMiniApp } from "@neynar/react";
import { ArrowUpRight, RotateCcw, AlertTriangle, MessageCircle } from "lucide-react";

interface JoinWaitlistFailedProps {
  onRetry?: () => void;
  errorMessage?: string;
  isRetrying?: boolean;
}

export default function JoinWaitlistFailed({ onRetry, errorMessage, isRetrying }: JoinWaitlistFailedProps) {
  const {
    actions: { composeCast, openUrl },
  } = useMiniApp();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleReportError = () => {
    const errorText = `Having trouble joining the Reauction waitlist. Error: ${
      errorMessage || "Unknown error"
    }. Can someone help? @emmo00`;
    composeCast({
      text: errorText,
      embeds: ["https://reauction.xyz"],
      channelKey: "reauction",
    });
  };

  const handleJoinDiscussion = () => {
    openUrl("https://farcaster.xyz/~/channel/reauction");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="relative h-full w-full opacity-25">
          <FaultyTerminal
            className=""
            style={{}}
            scale={1.5}
            gridMul={[2, 1]}
            digitSize={1.2}
            timeScale={1}
            pause={false}
            scanlineIntensity={1}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0}
            tint="#ae3bb0"
            mouseReact={true}
            mouseStrength={0.5}
            pageLoadAnimation={false}
            brightness={1}
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-500/20 p-4 backdrop-blur-sm border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">Oops! Something went wrong</h1>
            <p className="text-gray-300 leading-relaxed">
              We couldn't add you to the Reauction waitlist right now. This might be a temporary
              issue.
              {errorMessage && (
                <span className="block mt-2 text-sm text-red-300">Error: {errorMessage}</span>
              )}
            </p>
          </div>

          <div className="space-y-4">
            {onRetry && (
              <Button
                onClick={handleRetry}
                size="lg"
                className={`w-full h-12 rounded-full px-8 text-base font-semibold bg-purple-600 hover:bg-purple-700 ${isRetrying ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isRetrying}
              >
                Try Again
                <RotateCcw className="ml-2 h-4 w-4" />
              </Button>
            )}

            <Button
              onClick={handleReportError}
              size="lg"
              variant="outline"
              className="w-full h-12 rounded-full px-8 text-base font-semibold border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              Report Issue
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={handleJoinDiscussion}
              size="lg"
              variant="ghost"
              className="w-full h-12 rounded-full px-8 text-base font-semibold text-gray-400 hover:text-white hover:bg-white/5"
            >
              Join the Discussion
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
