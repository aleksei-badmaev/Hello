import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Caption: React.FC<{ text: string; emphasis?: boolean }> = ({
  text,
  emphasis,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.6 },
  });

  const framesFromEnd = durationInFrames - frame;
  const exit =
    framesFromEnd < 8 ? Math.max(0, framesFromEnd / 8) : 1;

  const scale = (0.85 + pop * 0.15) * exit + (1 - exit) * 0.95;
  const opacity = pop * exit;
  const translateY = (1 - pop) * 24;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: emphasis ? "38%" : "16%",
        display: "flex",
        justifyContent: "center",
        padding: "0 64px",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          background: emphasis
            ? "linear-gradient(135deg, #7c3aed, #2563eb)"
            : "rgba(0,0,0,0.55)",
          borderRadius: 28,
          padding: emphasis ? "28px 40px" : "22px 36px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily:
              "'Helvetica Neue', Arial, 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: emphasis ? 58 : 50,
            lineHeight: 1.15,
            textAlign: "center",
            color: "white",
            textShadow: "0 4px 18px rgba(0,0,0,0.45)",
            letterSpacing: -0.5,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};
