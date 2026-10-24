"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

type Section = { name: string; minutes: number; say: string; show: string };
type LiveScript = { title: string; target: string; sections: Section[]; tips: string[] };
type Highlight = {
  start: number;
  end: number;
  hook: string;
  hookEn: string;
  caption: string;
  hashtags: string[];
  why: string;
};

const input =
  "mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground";
const primary =
  "w-full rounded-xl bg-foreground py-3 font-medium text-background disabled:opacity-40 sm:w-auto sm:px-6";

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "실패했어요.");
  return data;
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-sm text-background">{n}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StudioClient() {
  const [product, setProduct] = useState("");
  const [store, setStore] = useState("");
  const [audience, setAudience] = useState("");
  const [script, setScript] = useState<LiveScript | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "analyzing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function makeScript(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setScriptBusy(true);
    setError(null);
    try {
      const { script } = await postJson<{ script: LiveScript }>("/api/script", { product, store, audience });
      setScript(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "실패했어요.");
    } finally {
      setScriptBusy(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setHighlights([]);
    setStage("uploading");
    setProgress(0);
    try {
      const blob = await upload(`live/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: file.size > 20 * 1024 * 1024,
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      setVideoUrl(blob.url);
      setStage("analyzing");
      const { highlights } = await postJson<{ highlights: Highlight[] }>("/api/highlights", { url: blob.url });
      setHighlights(highlights);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "실패했어요.");
      setStage("idle");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">라이브 한 번으로 홍보까지</h1>
      <p className="mt-2 text-muted">대본 받기 → 카메라 하나로 찍기 → AI 가 숏폼을 골라 SNS 에 올립니다.</p>
      {error && <p className="mt-4 rounded-xl border border-accent/40 px-4 py-3 text-sm text-accent">{error}</p>}

      <Step n={1} title="라이브 대본 받기">
        <form onSubmit={makeScript} className="space-y-3">
          <label className="block">
            <span className="text-sm text-muted">팔 상품</span>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="예: 수제 약과 선물세트 12개입, 2만 9천 원" className={input} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-muted">가게 (선택)</span>
              <input value={store} onChange={(e) => setStore(e.target.value)} placeholder="예: 강남역 근처 디저트 가게" className={input} />
            </label>
            <label className="block">
              <span className="text-sm text-muted">원하는 손님 (선택)</span>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="예: 한국 여행 온 미국·일본 20~30대" className={input} />
            </label>
          </div>
          <button disabled={scriptBusy || !product.trim()} className={primary}>
            {scriptBusy ? "대본 쓰는 중…" : "대본 만들기"}
          </button>
        </form>
        {script && (
          <div className="mt-6 space-y-3">
            <p className="font-medium">{script.title}</p>
            <p className="text-sm text-muted">시청자: {script.target}</p>
            <ol className="space-y-3">
              {script.sections.map((s, i) => (
                <li key={i} className="rounded-xl border border-line p-4">
                  <p className="text-sm font-medium">
                    {i + 1}. {s.name} <span className="text-muted">· {s.minutes}분</span>
                  </p>
                  <p className="mt-2 leading-relaxed">“{s.say}”</p>
                  <p className="mt-2 text-sm text-muted">화면: {s.show}</p>
                </li>
              ))}
            </ol>
            {script.tips.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {script.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Step>

      <Step n={2} title="찍은 라이브 영상 올리기">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-10 text-center hover:border-foreground">
          <span className="font-medium">영상 파일 고르기</span>
          <span className="text-sm text-muted">mp4·mov·m4a, 500MB 까지</span>
          <input type="file" accept="video/*,audio/*" className="hidden" disabled={stage === "uploading" || stage === "analyzing"} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {stage === "uploading" && <p className="mt-3 text-sm text-muted">올리는 중… {progress}%</p>}
        {stage === "analyzing" && <p className="mt-3 text-sm text-muted">받아쓰고 하이라이트를 고르는 중… (영상 길이에 따라 1~3분)</p>}
      </Step>

      <Step n={3} title="AI 가 고른 숏폼">
        {highlights.length === 0 ? (
          <p className="text-muted">영상을 올리면 여기 숏폼 후보 3개가 나와요.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((h, i) => (
              <ShortCard key={i} h={h} src={videoUrl!} />
            ))}
          </div>
        )}
      </Step>

      <Step n={4} title="SNS 에 올리기">
        <p className="text-muted">마음에 드는 숏폼을 골라 인스타그램 릴스·유튜브 쇼츠에 올립니다. 인스타 자동 업로드는 연결 중이에요 — 지금은 캡션을 복사해 쓸 수 있어요.</p>
      </Step>
    </main>
  );
}

function ShortCard({ h, src }: { h: Highlight; src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);

  function play() {
    const v = ref.current;
    if (!v) return;
    v.currentTime = h.start;
    void v.play();
  }

  async function copy() {
    await navigator.clipboard.writeText(`${h.caption}\n\n${h.hashtags.join(" ")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <button onClick={play} className="relative block aspect-[9/16] w-full bg-black text-left">
        <video
          ref={ref}
          src={`${src}#t=${h.start}`}
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= h.end) e.currentTarget.pause();
          }}
        />
        <span className="absolute inset-x-3 top-3 rounded-lg bg-black/60 px-3 py-2 text-base font-semibold text-white">
          {h.hook}
          <span className="block text-xs font-normal opacity-80">{h.hookEn}</span>
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-1 font-mono text-xs text-white">
          ▶ {fmt(h.start)}–{fmt(h.end)}
        </span>
      </button>
      <div className="space-y-2 p-3 text-sm">
        <p className="text-muted">{h.why}</p>
        <p className="leading-relaxed">{h.caption}</p>
        <p className="text-muted">{h.hashtags.join(" ")}</p>
        <button onClick={copy} className="w-full rounded-lg border border-line py-2 hover:border-foreground">
          {copied ? "복사됨" : "캡션 복사"}
        </button>
      </div>
    </div>
  );
}
