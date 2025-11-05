"use client";

import FaultyTerminal from "@/components/FaultyTerminal";
import MiniAppRequired from "@/components/MiniAppRequired";
import JoinWaitlistButton from "@/components/join-waitlist-button";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useRouter } from "next/navigation";
import { useMiniApp } from "@neynar/react";
import JoinWaitlistSuccess from "@/components/JoinWaitlistSuccess";
import JoinWaitlistFailed from "@/components/JoinWaitlistFailed";

export default function App() {
  const [showMiniAppRequired, setShowMiniAppRequired] = useState(false);
  const [joinWaitlistSuccess, setJoinWaitlistSuccess] = useState(false);
  const [joinWaitlistFailed, setJoinWaitlistFailed] = useState(false);
  const [joinWaitlistErrorMessage, setJoinWaitlistErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [retryJoinWaitlist, setRetryJoinWaitlist] = useState<() => void>(() => {});
  const [isRetryingJoinWaitlist, setIsRetryingJoinWaitlist] = useState(false);

  const { isInMiniApp } = useMiniApp();
  const router = useRouter();
  const isPreLaunch = process.env.NEXT_PUBLIC_PRE_LAUNCH === "true";

  useEffect(() => {
    console.log("before ready");
    sdk.actions.ready();
    console.log("after ready");
  }, []);

  const handleGetStarted = async () => {
    if (!(await isInMiniApp())) {
      setShowMiniAppRequired(true);
    } else {
      router.push("/home");
    }
  };

  if (showMiniAppRequired) {
    return <MiniAppRequired />;
  }

  if (joinWaitlistSuccess) {
    return <JoinWaitlistSuccess />;
  }

  if (joinWaitlistFailed) {
    return (
      <JoinWaitlistFailed
        errorMessage={joinWaitlistErrorMessage}
        onRetry={retryJoinWaitlist}
        isRetrying={isRetryingJoinWaitlist}
      />
    );
  }

  return (
    <>
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

        <div className="absolute px-4 bottom-8 mb-8 space-y-4">
          <h1 className="text-balance font-sans text-5xl font-bold leading-tight tracking-tight text-white">
            Resell and Auction
            <br /> Your Cast
            <br />
            Collectibles
          </h1>

          <p className="text-pretty font-sans leading-relaxed text-gray-200">
            Give your collectibles a second life. Earn by reselling or auctioning your Farcaster
            NFTs.
          </p>

          {isPreLaunch ? (
            <JoinWaitlistButton
              setJoinWaitlistSuccess={() => setJoinWaitlistSuccess(true)}
              setJoinWaitlistFailed={(error, onRetry, isRetrying) => {
                setJoinWaitlistErrorMessage(error);
                setRetryJoinWaitlist(() => onRetry);
                setIsRetryingJoinWaitlist(isRetrying);
                setJoinWaitlistFailed(true);
              }}
            />
          ) : (
            <Button
              size="lg"
              className="h-12 rounded-full px-8 text-base font-semibold"
              onClick={handleGetStarted}
            >
              Get Started <ChevronRight className="ml-2 h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          )}
        </div>
      </main>
    </>
  );
}
