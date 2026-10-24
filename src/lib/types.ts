import type { Locale } from "@/lib/i18n";

export type LiveScript = {
  title: string;
  target: string;
  sections: { name: string; minutes: number; say: string; show: string }[];
  tips: string[];
};

export type Highlight = {
  start: number;
  end: number;
  hook: string;
  hookEn: string;
  caption: string;
  hashtags: string[];
  why: string;
  // 손님 언어별 후킹·캡션(why 는 화면 언어 설명). 없으면 hook·caption(사장님 언어)을 쓴다.
  i18n?: Partial<Record<Locale, { hook: string; caption: string; why?: string }>>;
};
