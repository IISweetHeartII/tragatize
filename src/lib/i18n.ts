// 사이트 화면 언어이자 손님용 콘텐츠 언어. ko 가 기본(주소 접두어 없음), 나머지는 /{locale} 아래에 둔다.
import type { Highlight } from "@/lib/types";

export const LOCALES = ["ko", "en", "ja", "zh-CN", "zh-TW", "vi", "th"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";
export const OTHER_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

// 언어 메뉴에는 그 언어 자신의 이름으로 적는다.
export const LOCALE_NAMES: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  vi: "Tiếng Việt",
  th: "ไทย",
};

// 손님 나라(타깃). 나라마다 콘텐츠 언어 하나 — 미국·한국·일본·중국·대만·베트남·태국.
export const TARGET_FLAGS: Record<Locale, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
  "zh-CN": "🇨🇳",
  "zh-TW": "🇹🇼",
  vi: "🇻🇳",
  th: "🇹🇭",
};

export const OG_LOCALE: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  vi: "vi_VN",
  th: "th_TH",
};

// 헤더처럼 사전을 통째로 불러오기 아까운 곳에서 쓰는 짧은 문구
export const STUDIO_LABEL: Record<Locale, string> = {
  ko: "스튜디오",
  en: "Studio",
  ja: "スタジオ",
  "zh-CN": "工作室",
  "zh-TW": "工作室",
  vi: "Studio",
  th: "สตูดิโอ",
};

export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// 검색엔진용 언어별 주소(hreflang)
export function languageAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)]));
  out["x-default"] = path;
  return out;
}

export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1] ?? "";
  return isLocale(seg) && seg !== DEFAULT_LOCALE ? seg : DEFAULT_LOCALE;
}

export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

// "질문 {n}개" 같은 자리표시자를 채운다.
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

// 숏폼 후보의 후킹·캡션을 고른 언어로. 번역이 없으면 원문(한국어), 영어는 hookEn 으로 대신한다.
export function highlightText(h: Highlight, locale: Locale): { hook: string; caption: string } {
  const t = h.i18n?.[locale];
  if (t) return { hook: t.hook, caption: t.caption };
  if (locale === "en" && h.hookEn) return { hook: h.hookEn, caption: h.caption };
  return { hook: h.hook, caption: h.caption };
}

// «왜 이 장면?» 은 사장님이 읽는 설명이라 화면 언어로.
export function highlightWhy(h: Highlight, locale: Locale): string {
  return h.i18n?.[locale]?.why ?? h.why;
}

export function hasHighlightText(h: Highlight, locale: Locale): boolean {
  return !!h.i18n?.[locale] || locale === "ko" || (locale === "en" && !!h.hookEn);
}
