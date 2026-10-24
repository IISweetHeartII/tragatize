import { ask } from "@/lib/ai";
import { extractJson } from "@/lib/json";
import { allow, clientIp } from "@/lib/rate-limit";
import { transcribe, type Sentence } from "@/lib/scribe";

export const maxDuration = 300;

export type Highlight = {
  start: number;
  end: number;
  hook: string;
  hookEn: string;
  caption: string;
  hashtags: string[];
  why: string;
};

const SYSTEM = `당신은 라이브 커머스 영상에서 인스타그램 릴스·유튜브 쇼츠로 자를 하이라이트를 고르는 편집자입니다.
받아쓰기(초 단위 시각 포함)를 보고 «보는 사람이 사고 싶어지는 순간» 3개를 고르세요.
- 각 구간 15~45초, 서로 겹치지 않게. start·end 는 받아쓰기에 있는 시각 안에서 고른다.
- hook: 첫 1초에 띄울 한국어 후킹 문구(15자 안팎), hookEn: 같은 뜻의 영어(해외 손님용).
- caption: 인스타 캡션 2~3문장, hashtags: 5~8개(# 포함, 한국어·영어 섞어서).
- why: 왜 이 장면인지 한 문장.
반드시 JSON 하나만: {"highlights":[{"start":0,"end":0,"hook":"","hookEn":"","caption":"","hashtags":[],"why":""}]}`;

export async function POST(req: Request): Promise<Response> {
  if (!allow(`hl:${clientIp(req)}`, 6, 10 * 60_000)) {
    return Response.json({ error: "10분에 6번까지만 분석할 수 있어요." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  const url = body?.url ?? "";
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
  try {
    const { highlights } = extractJson<{ highlights: Highlight[] }>(await ask(SYSTEM, lines.slice(0, 60000), 3000));
    const last = sentences[sentences.length - 1].end;
    const clean = highlights
      .filter((h) => Number.isFinite(h.start) && Number.isFinite(h.end) && h.end > h.start)
      .map((h) => ({ ...h, start: Math.max(0, h.start), end: Math.min(last, h.end) }))
      .slice(0, 3);
    return Response.json({ highlights: clean, sentences });
  } catch (err) {
    console.error("highlights failed", err);
    return Response.json({ error: "하이라이트를 고르지 못했어요.", sentences }, { status: 502 });
  }
}
