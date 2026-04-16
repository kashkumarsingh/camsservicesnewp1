import { ImageResponse } from "next/og";

type OgImageInput = {
  title: string;
  summary: string;
};

export function createOgImageResponse({ title, summary }: OgImageInput): ImageResponse {
  const shortTitle = title.length > 88 ? `${title.slice(0, 85)}...` : title;
  const shortSummary = summary.length > 200 ? `${summary.slice(0, 197)}...` : summary;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(135deg, #0066FF 0%, #00D4FF 45%, #1A202C 100%)",
          color: "white",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.95,
          }}
        >
          CAMS Services
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.12 }}>{shortTitle}</div>
          <div style={{ fontSize: 24, lineHeight: 1.45, opacity: 0.9 }}>{shortSummary}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
