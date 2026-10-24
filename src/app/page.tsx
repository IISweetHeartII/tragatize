import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { getDict } from "@/lib/dict";
import { languageAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: languageAlternates("/") },
};

export default function Home() {
  return <Landing locale="ko" dict={getDict("ko")} />;
}
