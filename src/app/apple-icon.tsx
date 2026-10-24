import { ImageResponse } from "next/og";
import { BRAND_ACCENT } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16130f",
          color: "#fbfaf8",
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        T
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 34,
            width: 28,
            height: 28,
            borderRadius: 14,
            background: BRAND_ACCENT,
          }}
        />
      </div>
    ),
    size,
  );
}
