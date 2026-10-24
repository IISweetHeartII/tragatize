import type { Metadata } from "next";
import { StudioClient } from "@/app/studio/studio-client";
import { Landing } from "@/components/landing";
import { getDict, studioText } from "@/lib/dict";
import { OG_LOCALE, languageAlternates, localePath, type Locale } from "@/lib/i18n";

// /en·/ja·/zh-CN·/zh-TW·/vi·/th 의 랜딩·스튜디오. 언어마다 정적 폴더(app/{locale})를 두고 여기 내용을 쓴다.
// 동적 [lang] 대신 폴더를 둔 이유: 없는 주소가 진짜 404 를 내고, /pitch 같은 다른 경로와 겹치지 않게.
export function homeMetadata(locale: Locale): Metadata {
  const m = getDict(locale).meta;
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: localePath(locale, "/"), languages: languageAlternates("/") },
    openGraph: { title: m.title, description: m.description, locale: OG_LOCALE[locale], url: localePath(locale, "/") },
    twitter: { title: m.title, description: m.description },
  };
}

export function studioMetadata(locale: Locale): Metadata {
  const m = getDict(locale).meta;
  return {
    title: m.studioTitle,
    description: m.studioDescription,
    alternates: { canonical: localePath(locale, "/studio"), languages: languageAlternates("/studio") },
  };
}

export function LocaleHome({ locale }: { locale: Locale }) {
  return <Landing locale={locale} dict={getDict(locale)} />;
}

export function LocaleStudio({ locale }: { locale: Locale }) {
  return <StudioClient locale={locale} t={studioText(locale)} />;
}
