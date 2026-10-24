import { ImageResponse } from "next/og";
import { BRAND_ACCENT } from "@/lib/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon(): ImageResponse {
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
          borderRadius: 14,
          color: "#fbfaf8",
          fontSize: 44,
          fontWeight: 700,
        }}
      >
        T
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            width: 12,
            height: 12,
            borderRadius: 6,
            background: BRAND_ACCENT,
          }}
        />
      </div>
    ),
    size,
  );
}
