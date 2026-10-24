import type { Metadata } from "next";
import { getDict, studioText } from "@/lib/dict";
import { languageAlternates } from "@/lib/i18n";
import { StudioClient } from "./studio-client";

const meta = getDict("ko").meta;

export const metadata: Metadata = {
  title: meta.studioTitle,
  description: meta.studioDescription,
  alternates: { canonical: "/studio", languages: languageAlternates("/studio") },
};

export default function StudioPage() {
  return <StudioClient locale="ko" t={studioText("ko")} />;
}
