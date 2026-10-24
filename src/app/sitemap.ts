import type { MetadataRoute } from "next";
import { LOCALES, languageAlternates, localePath } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

// 공개 페이지만. lastModified 는 페이지 내용이 바뀐 날짜를 손으로 적는다(빌드 시각 금지).
const PAGES: Record<string, string> = {
  "/": "2026-10-24",
  "/studio": "2026-10-24",
};

const abs = (path: string) => new URL(path, SITE_URL).toString();

// 언어마다 한 줄씩, 서로를 hreflang 으로 잇는다.
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(PAGES).flatMap(([path, date]) =>
    LOCALES.map((locale) => ({
      url: abs(localePath(locale, path)),
      lastModified: date,
      alternates: { languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([k, v]) => [k, abs(v)])) },
    })),
  );
}
