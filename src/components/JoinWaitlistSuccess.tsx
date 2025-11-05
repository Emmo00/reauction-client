"use client";

import FaultyTerminal from "@/components/FaultyTerminal";
import { Button } from "@/components/ui/button";
import { useMiniApp } from "@neynar/react";
import { ArrowUpRight, Check, ChevronRight, Share2 } from "lucide-react";

const castTexts = [
  "Can't wait to try Reauction — finally a way to trade my Farcaster collectibles.",
  "Just joined the Reauction waitlist. Secondary markets are coming to Farcaster.",
  "Reauction is about to change how we collect and trade casts. Count me in.",
  "Early on Reauction. Let's make collectibles liquid again.",
  "Joined Reauction — the marketplace for your Farcaster collectibles.",
  "Excited for Reauction to launch. Time to put my collectibles back to work.",
  "Signed up for Reauction. Secondary auctions, real value.",
  "The collectible resale era on Farcaster starts with Reauction.",
  "Waiting for Reauction like it's the next big drop.",
  "Reauction is coming — and I'm early.",
];

export default function JoinWaitlistSuccess() {
  const {
    actions: { composeCast, openUrl },
  } = useMiniApp();
  const handleShareFarcaster = () => {
    const randomText = castTexts[Math.floor(Math.random() * castTexts.length)];
    composeCast({
      text: randomText,
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
            <div className="rounded-full bg-purple-500/20 p-4 backdrop-blur-sm border border-purple-500/20">
              <Check className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">Confirmed! You're now on our waitlist</h1>
            <p className="text-gray-300 leading-relaxed">
              We’re building Reauction — the go-to marketplace for trading your Farcaster
              collectibles. As one of the early supporters, you’ll get first access when we launch.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleShareFarcaster}
              size="lg"
              className="w-full h-12 rounded-full px-8 text-base font-semibold bg-purple-600 hover:bg-purple-700"
            >
              Invite your friends
              <Share2 className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={handleJoinDiscussion}
              size="lg"
              className="w-full h-12 rounded-full px-8 text-base font-semibold bg-purple-600 hover:bg-purple-700"
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
