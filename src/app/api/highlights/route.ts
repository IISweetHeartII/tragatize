import { ask } from "@/lib/ai";
import { LANGUAGE_FOR_AI, isLocale, parseLanguages, type Locale } from "@/lib/i18n";
import { extractJson } from "@/lib/json";
import { allow, clientIp } from "@/lib/rate-limit";
import { transcribe, type Sentence } from "@/lib/scribe";
import type { Highlight } from "@/lib/types";

export const maxDuration = 300;


const SYSTEM = `당신은 라이브 커머스 영상에서 인스타그램 릴스·유튜브 쇼츠로 자를 하이라이트를 고르는 편집자입니다.
받아쓰기(초 단위 시각 포함)를 보고 «보는 사람이 사고 싶어지는 순간» 3개를 고르세요.
- 각 구간 15~45초, 서로 겹치지 않게. start·end 는 받아쓰기에 있는 시각 안에서 고른다.
- hook: 첫 1초에 띄울 «사장님 언어» 후킹 문구(짧게), hookEn: 같은 뜻의 영어.
- caption: «사장님 언어» 인스타 캡션 2~3문장, why: 왜 이 장면인지 «사장님 언어» 한 문장.
- i18n: «손님 언어» 코드마다 {"hook","caption"} — 그 나라 손님에게 자연스러운 현지 문구로(직역 금지).
- hashtags: 5~10개(# 포함, 사장님 언어와 손님 언어를 섞어서).
반드시 JSON 하나만: {"highlights":[{"start":0,"end":0,"hook":"","hookEn":"","caption":"","hashtags":[],"why":"","i18n":{"en":{"hook":"","caption":""}}}]}`;

// 모델이 돌려준 i18n 에서 지원 언어·문자열만 남긴다.
function cleanI18n(v: unknown): Highlight["i18n"] {
  if (!v || typeof v !== "object") return undefined;
  const out: NonNullable<Highlight["i18n"]> = {};
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
    const t = x as { hook?: unknown; caption?: unknown } | null;
    if (isLocale(k) && t && typeof t.hook === "string" && typeof t.caption === "string") out[k as Locale] = { hook: t.hook, caption: t.caption };
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(req: Request): Promise<Response> {
  // 심사장 와이파이는 여러 명이 같은 IP 라 넉넉히 둔다.
  if (!allow(`hl:${clientIp(req)}`, 20, 10 * 60_000)) {
    return Response.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { url?: string; lang?: unknown; targets?: unknown } | null;
  const url = body?.url ?? "";
  const { lang, targets } = parseLanguages(body?.lang, body?.targets);
  if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url)) {
    return Response.json({ error: "올린 영상 주소가 아니에요." }, { status: 400 });
  }
  let sentences: Sentence[];
  try {
    sentences = (await transcribe(url)).sentences;
  } catch (err) {
    console.error("transcribe failed", err);
    return Response.json({ error: "받아쓰기에 실패했어요." }, { status: 502 });
  }
  if (sentences.length === 0) return Response.json({ error: "영상에서 말소리를 찾지 못했어요." }, { status: 422 });
  const lines = sentences.map((s) => `[${s.start.toFixed(1)}-${s.end.toFixed(1)}] ${s.text}`).join("\n");
  const langs = [
    `사장님 언어: ${LANGUAGE_FOR_AI[lang]}`,
    `손님 언어(i18n 코드: 언어): ${targets.map((l) => `${l}: ${LANGUAGE_FOR_AI[l]}`).join(", ")}`,
  ].join("\n");
  try {
    // 손님 언어 하나당 후킹·캡션 3개씩이 늘어나므로 출력 한도를 늘린다.
    const maxTokens = Math.min(9000, 3000 + 800 * targets.length);
    const { highlights } = extractJson<{ highlights: Highlight[] }>(await ask(SYSTEM, `${langs}\n\n받아쓰기:\n${lines.slice(0, 60000)}`, maxTokens));
    const last = sentences[sentences.length - 1].end;
    const clean = highlights
      .filter((h) => Number.isFinite(h.start) && Number.isFinite(h.end) && h.end > h.start)
      .map((h) => ({ ...h, start: Math.max(0, h.start), end: Math.min(last, h.end), i18n: cleanI18n(h.i18n) }))
      .slice(0, 3);
    return Response.json({ highlights: clean, sentences });
  } catch (err) {
    console.error("highlights failed", err);
    return Response.json({ error: "하이라이트를 고르지 못했어요.", sentences }, { status: 502 });
  }
}
