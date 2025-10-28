import React, { forwardRef } from "react";
import { CastResponse } from "@neynar/nodejs-sdk/build/api";

interface CollectibleImageProps {
  cast: CastResponse;
  className?: string;
  size?: number; // Width and height in pixels
  borderRadius?: number; // Border radius in pixels
  onClick?: () => void;
}

// Type guard to check if embed is a URL embed (not a cast embed)
function isUrlEmbed(
  embed: any
): embed is { url: string; metadata?: { content_type?: string; [key: string]: any } } {
  return embed && typeof embed === "object" && typeof embed.url === "string";
}

export const CollectibleImage = forwardRef<HTMLDivElement, CollectibleImageProps>(
  ({ cast, className = "", size = 600, borderRadius = 24, onClick }, ref) => {
    const castData = cast.cast;

    // Extract text content (remove URLs and clean up)
    const cleanText =
      castData.text
        ?.replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
        ?.replace(/\n+/g, " ") // Replace line breaks with spaces
        ?.trim()
        ?.slice(0, 280) || ""; // Increased limit for better readability

    // Adjust font size based on text length
    const getTextFontSize = (text: string, baseSize: number) => {
      if (text.length < 50) return baseSize * 1.2; // Larger for short text
      if (text.length > 150) return baseSize * 0.85; // Smaller for long text
      return baseSize;
    };

    // Get the first embed that's an image or video
    const backgroundMedia = castData.embeds?.find((embed) => {
      if (!isUrlEmbed(embed)) return false;

      // Check if it's an image or video based on URL extension or content type
      const isImage =
        embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
        embed.metadata?.content_type?.startsWith("image/");
      const isVideo =
        embed.url.match(/\.(mp4|webm|mov|m3u8)$/i) ||
        embed.metadata?.content_type?.startsWith("video/") ||
        embed.metadata?.content_type === "application/vnd.apple.mpegurl" ||
        embed.metadata?.content_type === "application/x-mpegURL";

      return isImage || isVideo;
    });

    // Determine if it's a video
    const isVideo =
      backgroundMedia &&
      isUrlEmbed(backgroundMedia) &&
      (backgroundMedia.url?.match(/\.(mp4|webm|mov|m3u8)$/i) ||
        backgroundMedia.metadata?.content_type?.startsWith("video/") ||
        backgroundMedia.metadata?.content_type === "application/vnd.apple.mpegurl" ||
        backgroundMedia.metadata?.content_type === "application/x-mpegURL");

    // Fallback background color based on cast hash or author FID
    const getBackgroundColor = () => {
      const hash = castData.hash || castData.author?.fid?.toString() || "0";
      const colors = [
        "#667eea",
        "#764ba2",
        "#f093fb",
        "#f5576c",
        "#4facfe",
        "#43e97b",
        "#fa709a",
        "#fee140",
        "#a8edea",
        "#d299c2",
      ];
      // Use last character of hash for more distribution
      const index = parseInt(hash.slice(-1), 16) % colors.length;
      return colors[index];
    };

    // Generate meaningful fallback text
    const getDisplayText = () => {
      if (cleanText) return cleanText;

      // If no text but has media, create descriptive text
      if (backgroundMedia && isUrlEmbed(backgroundMedia)) {
        if (isVideo) {
          return "Video Cast";
        } else {
          return "Image Cast";
        }
      }

      // If posted in a channel, use channel name
      if (castData.channel?.name) {
        return `Cast from /${castData.channel.name}`;
      }

      // Default fallback
      return "Farcaster Cast";
    };

    const displayText = getDisplayText();

    // Calculate responsive font sizes based on container size
    const baseFontSize = (size / 600) * 24;
    const displayNameSize = (size / 600) * 20;
    const usernameSize = (size / 600) * 15;
    const padding = (size / 600) * 30;
    const footerPadding = (size / 600) * 20;
    const avatarSize = (size / 600) * 60;
    const avatarMargin = (size / 600) * 10;

    return (
      <div
        ref={ref}
        className={`nft-card ${className}`}
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${borderRadius}px`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "white",
          backgroundColor: backgroundMedia ? "#242424" : getBackgroundColor(),
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        onClick={() => onClick && onClick()}
      >
        {/* Background media */}
        {backgroundMedia && (
          <>
            {isVideo ? (
              <video
                style={{
                  position: "absolute",
                  inset: 0,
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  filter: "brightness(0.4)",
                  zIndex: 0,
                }}
                autoPlay
                loop
                muted
                playsInline
                crossOrigin="anonymous"
              >
                <source
                  src={isUrlEmbed(backgroundMedia) ? backgroundMedia.url : ""}
                  type="video/mp4"
                />
              </video>
            ) : (
              <img
                src={isUrlEmbed(backgroundMedia) ? backgroundMedia.url : ""}
                alt="Cast background"
                style={{
                  position: "absolute",
                  inset: 0,
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  filter: "brightness(0.4)",
                  zIndex: 0,
                }}
                crossOrigin="anonymous"
              />
            )}
          </>
        )}

        {/* Main text content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: `${padding}px`,
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            fontSize: `${getTextFontSize(cleanText, baseFontSize)}px`,
            fontWeight: 600,
            lineHeight: 1.4,
            color: "#fff",
            textShadow: backgroundMedia
              ? "2px 2px 8px rgba(0,0,0,0.8)"
              : "2px 2px 4px rgba(0,0,0,0.3)",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          {displayText || "Untitled Cast"}
        </div>

        {/* Footer with user info */}
        <div>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              padding: `${footerPadding}px ${padding}px`,
              background: backgroundMedia
                ? "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4))"
                : "rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(12px)",
              borderBottomLeftRadius: `${borderRadius}px`,
              borderBottomRightRadius: `${borderRadius}px`,
            }}
          >
            <img
              src={
                castData.author?.pfp_url ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${
                  castData.author?.username || castData.author?.fid || "anon"
                }`
              }
              alt={`${
                castData.author?.display_name || castData.author?.username || "Anonymous"
              } profile`}
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
                borderRadius: "50%",
                marginRight: `${avatarMargin}px`,
                border: "3px solid rgba(255, 255, 255, 0.5)",
                objectFit: "cover",
                backgroundColor: "#f0f0f0",
              }}
              crossOrigin="anonymous"
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: `${displayNameSize}px`,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  marginBottom: "2px",
                  color: "#fff",
                }}
              >
                {castData.author?.display_name || castData.author?.username || "Anonymous"}
              </div>
              <div
                style={{
                  fontSize: `${usernameSize}px`,
                  color: "rgba(255, 255, 255, 0.8)",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
                }}
              >
                @{castData.author?.username || "anon"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CollectibleImage.displayName = "CollectibleImage";

// Example usage:
// <CollectibleImage
//   cast={castResponse}
//   size={600}
//   borderRadius={16}
//   className="my-collectible-nft"
// />
//
// For html2canvas export:
// const ref = useRef<HTMLDivElement>(null);
// <CollectibleImage ref={ref} cast={castResponse} size={1200} borderRadius={32} />
// html2canvas(ref.current).then(canvas => { /* save canvas */ })
