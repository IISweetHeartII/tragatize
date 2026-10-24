import "server-only";

// ElevenLabs Scribe(scribe_v2) 받아쓰기. 공개 URL 을 넘기면 ElevenLabs 가 직접 받아 간다.
export type Sentence = { start: number; end: number; text: string };

type Word = { text: string; start: number; end: number; type: "word" | "spacing" | "audio_event" };

export async function transcribe(url: string): Promise<{ text: string; sentences: Sentence[] }> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
  const form = new FormData();
  form.set("model_id", "scribe_v2");
  form.set("cloud_storage_url", url);
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });
  if (!res.ok) throw new Error(`scribe ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { text: string; words?: Word[] };
  return { text: data.text, sentences: toSentences(data.words ?? []) };
}

// 단어를 문장(마침표·물음표·느낌표 또는 0.8초 이상 쉼) 단위로 묶는다.
function toSentences(words: Word[]): Sentence[] {
  const out: Sentence[] = [];
  let cur: Sentence | null = null;
  let lastEnd = 0;
  for (const w of words) {
    if (w.type === "audio_event") continue;
    if (w.type === "spacing") {
      if (cur) cur.text += " ";
      continue;
    }
    if (cur && w.start - lastEnd > 0.8) {
      out.push(cur);
      cur = null;
    }
    if (!cur) cur = { start: w.start, end: w.end, text: "" };
    cur.text += w.text;
    cur.end = w.end;
    lastEnd = w.end;
    if (/[.?!。]$/.test(w.text)) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  return out.map((s) => ({ ...s, text: s.text.trim() })).filter((s) => s.text);
}
