import "server-only";
import type { Locale } from "@/lib/i18n";
import ko from "./ko.json";
import en from "./en.json";
import ja from "./ja.json";
import zhCN from "./zh-CN.json";

// 화면 문구 사전. 서버에서만 불러 필요한 부분만 클라이언트에 넘긴다(언어 7개를 통째로 번들에 싣지 않게).
export type Dict = typeof ko;
export type StudioDict = Dict["studio"];

const DICTS: Partial<Record<Locale, Dict>> = { ko, en, ja, "zh-CN": zhCN };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? ko;
}

// 스튜디오(클라이언트)에 넘기는 부분만 모은다.
export type StudioText = StudioDict & Pick<Dict, "samples" | "planTags" | "countries">;

export function studioText(locale: Locale): StudioText {
  const d = getDict(locale);
  return { ...d.studio, samples: d.samples, planTags: d.planTags, countries: d.countries };
}
