"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { DEMO_PRESETS, type DemoPreset } from "@/lib/demo";
import type { Highlight, LiveScript } from "@/lib/types";

const input =
  "mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground";
const primary =
  "w-full rounded-xl bg-foreground py-3 font-medium text-background disabled:opacity-40 sm:w-auto sm:px-6";

const EXAMPLES = [
  { product: "수제 약과 선물세트 12개입, 2만 9천 원", store: "강남역 근처 전통 디저트 가게", audience: "한국 여행 온 미국·일본 20~30대" },
  { product: "한복 대여 2시간 + 사진 촬영, 3만 5천 원", store: "경복궁 앞 한복 대여점", audience: "서울 여행 온 동남아·중국 관광객" },
  { product: "직접 볶은 원두 200g, 1만 8천 원", store: "성수동 로스터리 카페", audience: "국내 20~30대 홈카페족" },
];

const READY_PRESETS = DEMO_PRESETS.filter((p) => p.videoUrl && p.highlights.length > 0);
const HAS_DEMO = READY_PRESETS.length > 0;

// 샘플은 미리 계산된 실제 AI 결과를 단계별로 보여 준다(대본 3초 → 컷 편집·추천 약 10초).
const DEMO_STEPS = [
  { label: "라이브 대본 쓰는 중", ms: 3000 },
  { label: "말 받아쓰는 중", ms: 2500 },
  { label: "장면 분석 중", ms: 2500 },
  { label: "컷 편집·숏폼 추천 중", ms: 3000 },
  { label: "자막·캡션 쓰는 중", ms: 2000 },
];

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

function Step({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line py-8">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-sm text-background">{n}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type StepState = "done" | "active" | "todo" | "soon";

function Stepper({ states }: { states: StepState[] }) {
  const labels = ["대본", "촬영·업로드", "AI 숏폼", "SNS 올리기"];
  const ids = ["step-script", "step-upload", "step-shorts", "step-sns"];
  return (
    <nav className="sticky top-14 z-10 -mx-4 border-b border-line bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
      <ol className="flex items-center justify-between gap-1">
        {labels.map((label, i) => {
          const s = states[i];
          return (
            <li key={label} className="flex-1">
              <a href={`#${ids[i]}`} className="flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm">
                <span
                  className={
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs " +
                    (s === "done"
                      ? "bg-foreground text-background"
                      : s === "active"
                        ? "border-2 border-accent text-accent"
                        : "border border-line text-muted")
                  }
                >
                  {s === "done" ? "✓" : i + 1}
                </span>
                <span className={(s === "active" ? "inline" : "hidden sm:inline") + (s === "todo" || s === "soon" ? " text-muted" : "")}>
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
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
  const [elapsed, setElapsed] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 분석 중 경과 시간(실제 진행률이 없으므로 시간만 정직하게 보여 준다)
  // 시작 시각은 분석에 들어갈 때(onFile) 기록하고, effect 는 1초 타이머만 돈다.
  const analyzeStartedAt = useRef(0);
  useEffect(() => {
    if (stage !== "analyzing") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - analyzeStartedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [stage]);

  function scrollTo(id: string) {
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
  }

  const [demoStep, setDemoStep] = useState<number | null>(null);
  const [demoId, setDemoId] = useState<string | null>(null);
  const demoTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function runPreset(preset: DemoPreset) {
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
    setError(null);
    setDemoId(preset.id);
    setProduct(preset.product);
    setStore("");
    setAudience("");
    setScript(null);
    setHighlights([]);
    setVideoUrl(null);
    setStage("idle");
    setIsDemo(true);
    setDemoStep(0);
    let at = 0;
    DEMO_STEPS.forEach((step, i) => {
      at += step.ms;
      demoTimers.current.push(
        setTimeout(() => {
          if (i === 0) {
            setScript(preset.script);
            setVideoUrl(preset.videoUrl);
          }
          if (i === DEMO_STEPS.length - 1) {
            setHighlights(preset.highlights);
            setStage("done");
            setDemoStep(null);
            scrollTo("step-shorts");
          } else {
            setDemoStep(i + 1);
          }
        }, at),
      );
    });
  }

  useEffect(() => () => demoTimers.current.forEach(clearTimeout), []);

  function showDemo() {
    if (!HAS_DEMO) {
      // 샘플 결과가 아직 없으면 예시 상품만 채워 대본부터 보게 한다.
      fill(0);
      scrollTo("step-script");
      return;
    }
    runPreset(READY_PRESETS[0]);
  }

  // 랜딩의 «샘플로 바로 보기»(/studio?demo=1) — 첫 렌더 뒤에 한 번 실행한다.
  useEffect(() => {
    if (new URLSearchParams(location.search).get("demo") !== "1") return;
    const t = setTimeout(showDemo, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fill(i: number) {
    const e = EXAMPLES[i];
    setProduct(e.product);
    setStore(e.store);
    setAudience(e.audience);
  }

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
    setIsDemo(false);
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
      analyzeStartedAt.current = Date.now();
      setElapsed(0);
      setStage("analyzing");
      const { highlights } = await postJson<{ highlights: Highlight[] }>("/api/highlights", { url: blob.url });
      setHighlights(highlights);
      setStage("done");
      scrollTo("step-shorts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "실패했어요.");
      setStage("idle");
    }
  }

  const busy = stage === "uploading" || stage === "analyzing";
  const states: StepState[] = [
    script ? "done" : "active",
    busy ? "active" : videoUrl ? "done" : script ? "active" : "todo",
    highlights.length > 0 ? "done" : "todo",
    "soon",
  ];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
      <Stepper states={states} />

      <div className="pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">라이브 한 번으로 홍보까지</h1>
        <p className="mt-2 text-muted">대본 받기 → 카메라 하나로 찍기 → AI 가 숏폼을 골라 SNS 에 올립니다.</p>
        <p className="mt-6 text-sm font-medium">샘플 라이브로 바로 보기</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {DEMO_PRESETS.map((p) => {
            const ready = READY_PRESETS.includes(p);
            const active = demoId === p.id;
            return (
              <button
                key={p.id}
                disabled={!ready || demoStep !== null}
                onClick={() => runPreset(p)}
                className={
                  "min-h-11 rounded-xl border px-4 py-3 text-left disabled:opacity-50 " +
                  (active ? "border-foreground bg-line/40" : "border-line hover:border-foreground")
                }
              >
                <span className="block font-mono text-xs text-muted">{p.category}</span>
                <span className="block font-medium">{p.title}</span>
                <span className="block text-sm text-muted">{ready ? (active ? "선택됨" : "▶ 눌러서 보기") : "샘플 촬영 중"}</span>
              </button>
            );
          })}
        </div>
        {demoStep !== null && (
          <ol className="mt-4 space-y-1.5 rounded-xl border border-line p-4 text-sm">
            {DEMO_STEPS.map((s, i) => (
              <li key={s.label} className={i < demoStep ? "" : i === demoStep ? "text-accent" : "text-muted"}>
                {i < demoStep ? "✓" : i === demoStep ? "◉" : "○"} {s.label}
              </li>
            ))}
          </ol>
        )}
        {error && <p className="mt-4 rounded-xl border border-accent/40 px-4 py-3 text-sm text-accent">{error}</p>}
      </div>

      <Step id="step-script" n={1} title="라이브 대본 받기">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="self-center text-sm text-muted">예시:</span>
          {EXAMPLES.map((e, i) => (
            <button key={i} onClick={() => fill(i)} className="min-h-9 rounded-full border border-line px-3 text-sm hover:border-foreground">
              {e.product.split(",")[0]}
            </button>
          ))}
        </div>
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
            {scriptBusy ? "대본 쓰는 중… (20~30초)" : "대본 만들기"}
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

      <Step id="step-upload" n={2} title="찍은 라이브 영상 올리기">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) void onFile(e.dataTransfer.files?.[0]);
          }}
          className={
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center hover:border-foreground " +
            (dragging ? "border-foreground bg-line/40" : "border-line")
          }
        >
          <span className="font-medium">{dragging ? "여기에 놓으세요" : "영상을 끌어다 놓거나 눌러서 고르기"}</span>
          <span className="text-sm text-muted">mp4·mov·m4a, 500MB 까지 · 2분 안팎 세로 영상 권장</span>
          <input type="file" accept="video/*,audio/*" className="hidden" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {stage === "uploading" && (
          <div className="mt-4">
            <p className="text-sm text-muted">올리는 중… {progress}%</p>
            <div className="mt-2 h-1.5 rounded-full bg-line">
              <div className="h-1.5 rounded-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {stage === "analyzing" && (
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>✓ 업로드</li>
            <li className={elapsed < 20 ? "text-accent" : ""}>{elapsed < 20 ? "◉" : "✓"} 말 받아쓰는 중 (ElevenLabs)</li>
            <li className={elapsed < 20 ? "text-muted" : "text-accent"}>{elapsed < 20 ? "○" : "◉"} 사고 싶어지는 순간 고르는 중 (Claude)</li>
            <li className="pt-1 font-mono text-xs text-muted">{fmt(elapsed)} 경과 · 보통 30초~2분</li>
            {HAS_DEMO && (
              <li>
                <button onClick={showDemo} className="text-sm underline underline-offset-4">
                  기다리는 동안 샘플 결과 보기
                </button>
              </li>
            )}
          </ul>
        )}
      </Step>

      <Step id="step-shorts" n={3} title="AI 가 고른 숏폼 후보">
        {highlights.length === 0 ? (
          <p className="text-muted">영상을 올리면 여기 숏폼 후보 3개가 나와요.</p>
        ) : (
          <>
            {isDemo && (
              <p className="mb-3 inline-block rounded-full border border-line px-3 py-1 text-xs text-muted">
                샘플 결과 · 실제 AI 실행본(미리 계산)
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((h, i) => (
                <ShortCard key={`${videoUrl}-${i}`} h={h} src={videoUrl!} />
              ))}
            </div>
          </>
        )}
      </Step>

      <Step id="step-sns" n={4} title="SNS 에 올리기">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button disabled className="rounded-xl bg-foreground px-6 py-3 font-medium text-background opacity-40">
            인스타그램 릴스에 올리기 · 연결 중
          </button>
          <button disabled className="rounded-xl border border-line px-6 py-3 font-medium opacity-40">
            유튜브 쇼츠 · 준비 중
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">지금은 숏폼 카드의 «캡션 복사» 로 바로 붙여 넣을 수 있어요.</p>
      </Step>
    </main>
  );
}

function ShortCard({ h, src }: { h: Highlight; src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (!v.paused) {
      v.pause();
      return;
    }
    if (v.currentTime < h.start || v.currentTime >= h.end) v.currentTime = h.start;
    void v.play();
  }

  async function copy() {
    await navigator.clipboard.writeText(`${h.hook}\n${h.hookEn}\n\n${h.caption}\n\n${h.hashtags.join(" ")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <button onClick={toggle} className="relative block aspect-[9/16] w-full bg-black text-left">
        <video
          ref={ref}
          src={`${src}#t=${h.start}`}
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= h.end) e.currentTarget.pause();
          }}
        />
        <span className="absolute inset-x-3 top-3 rounded-lg bg-black/60 px-3 py-2 text-base font-semibold text-white">
          {h.hook}
          <span className="block text-xs font-normal opacity-80">{h.hookEn}</span>
        </span>
        {!playing && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-xl text-black">▶</span>
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-1 font-mono text-xs text-white">
          {fmt(h.start)}–{fmt(h.end)} · {Math.round(h.end - h.start)}초
        </span>
      </button>
      <div className="space-y-2 p-3 text-sm">
        <p className="font-medium">
          <span className="mr-1 text-accent">왜 이 장면?</span>
          {h.why}
        </p>
        <p className="leading-relaxed">{h.caption}</p>
        <p className="text-muted">{h.hashtags.join(" ")}</p>
        <button onClick={copy} className="min-h-11 w-full rounded-lg border border-line hover:border-foreground">
          {copied ? "복사됨" : "캡션 복사"}
        </button>
      </div>
    </div>
  );
}
