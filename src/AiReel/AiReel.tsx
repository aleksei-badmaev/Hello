import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption } from "./Caption";
import { segments, totalDurationInFrames } from "./segments";

const Badge: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.6 + Math.abs(Math.sin(frame / 10)) * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 40,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(0,0,0,0.5)",
        borderRadius: 999,
        padding: "10px 20px",
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: "#22c55e",
          opacity: pulse,
        }}
      />
      <span
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "white",
          letterSpacing: 0.5,
        }}
      >
        AI EDIT
      </span>
    </div>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / totalDurationInFrames);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        background: "rgba(255,255,255,0.2)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, #22c55e, #7c3aed)",
        }}
      />
    </div>
  );
};

export const AiReel: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {segments.map((segment, index) => (
          <Series.Sequence
            key={index}
            durationInFrames={segment.durationInFrames}
          >
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(segment.src)}
                startFrom={Math.round(segment.startFromSeconds * fps)}
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <AbsoluteFill
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.45) 100%)",
                }}
              />
              <Caption text={segment.caption} emphasis={segment.emphasis} />
            </AbsoluteFill>
          </Series.Sequence>
        ))}
      </Series>
      <Badge />
      <ProgressBar />
      <Audio src={staticFile("audio/bg-music.wav")} volume={0.9} />
    </AbsoluteFill>
  );
};
