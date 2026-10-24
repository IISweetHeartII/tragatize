import "server-only";
import type { Locale } from "@/lib/i18n";
import ko from "./ko.json";

// 화면 문구 사전. 서버에서만 불러 필요한 부분만 클라이언트에 넘긴다(언어 7개를 통째로 번들에 싣지 않게).
export type Dict = typeof ko;
export type StudioDict = Dict["studio"];

const DICTS: Partial<Record<Locale, Dict>> = { ko };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? ko;
}
