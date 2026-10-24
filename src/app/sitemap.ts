import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 공개 페이지만. lastModified 는 페이지 내용이 바뀐 날짜를 손으로 적는다(빌드 시각 금지).
const PAGES: Record<string, string> = {
  "/": "2026-10-24",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(PAGES).map(([path, date]) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: date,
  }));
}
