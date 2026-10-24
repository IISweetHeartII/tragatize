import { ImageResponse } from "next/og";
import { BRAND_ACCENT } from "@/lib/site";

// 기본 폰트에 한글 글리프가 없어 OG 그림 글자는 영어로만 쓴다.
export const alt = "Tragatize — Ambition for Korea 2026 · Wildcard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0e0c0a",
          color: "#f3efe9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#9b9389" }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, background: BRAND_ACCENT }} />
          AMBITION FOR KOREA · 2026 · WILDCARD
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 140, fontWeight: 700, letterSpacing: -4 }}>Tragatize</div>
          <div style={{ fontSize: 44, color: "#9b9389", marginTop: 12 }}>From Korea, to the world.</div>
        </div>
        <div style={{ fontSize: 26, color: "#9b9389" }}>tragatize.log8.kr</div>
      </div>
    ),
    size,
  );
}
