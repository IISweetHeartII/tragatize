import type { Metadata } from "next";
import { getDict, studioText } from "@/lib/dict";
import { StudioClient } from "./studio-client";

const meta = getDict("ko").meta;

export const metadata: Metadata = {
  title: meta.studioTitle,
  description: meta.studioDescription,
};

export default function StudioPage() {
  return <StudioClient locale="ko" t={studioText("ko")} />;
}
