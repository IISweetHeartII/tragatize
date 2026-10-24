"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { DEMO_PRESETS, type DemoPreset, type Plan } from "@/lib/demo";
import type { StudioText } from "@/lib/dict";
import { LOCALES, TARGET_FLAGS, fill, hasHighlightText, highlightText, highlightWhy, type Locale } from "@/lib/i18n";
import type { Highlight, LiveScript } from "@/lib/types";
import {
  AI_STEP_COUNT,
  AiVideoPanel,
  DecoStep,
  MockBadge,
  NO_DECO,
  PhoneStep,
  SnsStep,
  TextProvider,
  VideoOverlays,
  decoFor,
  useT,
  type Deco,
} from "./extras";

const input =
  "mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground";
const primary =
  "w-full rounded-xl bg-foreground py-3 font-medium text-background disabled:opacity-40 sm:w-auto sm:px-6";

const READY_PRESETS = DEMO_PRESETS.filter((p) => p.videoUrl && p.highlights.length > 0);
const HAS_DEMO = READY_PRESETS.length > 0;
// Premium «AI 홍보 영상 만들기» 는 시연용이라 미리 만든 AI 영상 샘플을 결과로 보여 준다.
const AI_SAMPLE = READY_PRESETS.find((p) => p.plan === "premium") ?? null;

// 샘플은 미리 계산된 실제 AI 결과를 단계별로 보여 준다(대본 3초 → 컷 편집·추천 약 10초). 단계 이름은 사전 demoSteps.
const DEMO_MS: Record<Plan, number[]> = {
  lite: [3000, 2500, 2500, 3000, 2000],
  premium: [3000, 4000, 3000, 2000],
};

// 손님 나라 기본값: 화면 언어 + 한국·미국·일본·중국 중에서 4개
function defaultTargets(locale: Locale): Locale[] {
  return [...new Set<Locale>([locale, "ko", "en", "ja", "zh-CN"])].slice(0, 4);
}

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "");
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

type StepState = "done" | "active" | "todo";

function Stepper({ states, labels }: { states: StepState[]; labels: string[] }) {
  const ids = ["step-script", "step-upload", "step-shorts", "step-phone", "step-deco", "step-sns"];
  return (
    <nav className="sticky top-14 z-10 -mx-4 border-b border-line bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
      <ol className="flex items-center justify-between gap-1">
        {labels.map((label, i) => {
          const s = states[i];
          return (
            <li key={label} className={s === "active" ? "flex-[2] sm:flex-1" : "flex-1"}>
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
                <span className={"whitespace-nowrap " + (s === "active" ? "inline" : "hidden sm:inline") + (s === "todo" ? " text-muted" : "")}>
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

export function StudioClient({ locale, t }: { locale: Locale; t: StudioText }) {
  const [product, setProduct] = useState("");
  const [store, setStore] = useState("");
  const [audience, setAudience] = useState("");
  const [targets, setTargets] = useState<Locale[]>(() => defaultTargets(locale));
  const [shortsLang, setShortsLang] = useState<Locale>(locale);
  const [script, setScript] = useState<LiveScript | null>(null);
  const [scriptBusy, setScriptBusy] = useState(false);

  const [plan, setPlan] = useState<Plan>("lite");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "analyzing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시연용 단계(전화·꾸미기·SNS) 상태
  const [phone, setPhone] = useState<string | null>(null);
  const [deco, setDeco] = useState<Deco>(NO_DECO);
  const [posted, setPosted] = useState(false);
  const [aiProgress, setAiProgress] = useState<number | null>(null);

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

  function clearTimers() {
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
  }

  function resetResult() {
    setHighlights([]);
    setVideoUrl(null);
    setStage("idle");
    setPosted(false);
    setAiProgress(null);
  }

  function runPreset(preset: DemoPreset) {
    clearTimers();
    setError(null);
    setDemoId(preset.id);
    setPlan(preset.plan);
    setProduct(preset.product);
    setStore("");
    setAudience("");
    setScript(null);
    resetResult();
    setIsDemo(true);
    setDemoStep(0);
    const steps = DEMO_MS[preset.plan];
    let at = 0;
    steps.forEach((ms, i) => {
      at += ms;
      demoTimers.current.push(
        setTimeout(() => {
          if (i === 0) setScript(preset.script);
          if (i === 0 && preset.plan === "lite") setVideoUrl(preset.videoUrl);
          if (i === 1 && preset.plan === "premium") setVideoUrl(preset.videoUrl);
          if (i === steps.length - 1) {
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

  // Premium: 템플릿·자료를 받아 «AI 홍보 영상» 을 만드는 시연(결과는 미리 만든 AI 영상 샘플)
  function runAiVideo() {
    if (!AI_SAMPLE) return;
    clearTimers();
    setError(null);
    resetResult();
    setIsDemo(true);
    setDemoId(null);
    setAiProgress(0);
    const ms = [1800, 2000, 3200, 2000, 2200];
    let at = 0;
    ms.forEach((d, i) => {
      at += d;
      demoTimers.current.push(
        setTimeout(() => {
          if (i === 3) setVideoUrl(AI_SAMPLE.videoUrl);
          if (i === AI_STEP_COUNT - 1) {
            setHighlights(AI_SAMPLE.highlights);
            setStage("done");
            setAiProgress(null);
            scrollTo("step-shorts");
          } else {
            setAiProgress(i + 1);
          }
        }, at),
      );
    });
  }

  useEffect(() => () => demoTimers.current.forEach(clearTimeout), []);

  function showDemo() {
    if (!HAS_DEMO) {
      // 샘플 결과가 아직 없으면 예시 상품만 채워 대본부터 보게 한다.
      fillExample(0);
      scrollTo("step-script");
      return;
    }
    runPreset(READY_PRESETS[0]);
  }

  // 랜딩 링크: /studio?demo=1 은 샘플 바로 보기, /studio?plan=premium 은 AI 영상 탭으로 시작
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = setTimeout(() => {
      if (q.get("plan") === "premium") setPlan("premium");
      if (q.get("demo") === "1") showDemo();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 서버 오류 문구는 한국어라 다른 언어 화면에서는 사전 문구로 보여 준다.
  function showError(err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    setError(locale === "ko" && msg ? msg : t.failed);
  }

  // 손님 나라는 하나 이상 남긴다.
  function toggleTarget(l: Locale) {
    setTargets((xs) => (xs.includes(l) ? (xs.length > 1 ? xs.filter((x) => x !== l) : xs) : LOCALES.filter((x) => x === l || xs.includes(x))));
  }

  function fillExample(i: number) {
    const e = t.examples[i];
    setProduct(e.product);
    setStore(e.store);
    setAudience(e.audience);
  }

  async function makeScript(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setScriptBusy(true);
    setError(null);
    try {
      const { script } = await postJson<{ script: LiveScript }>("/api/script", { product, store, audience, lang: locale, targets });
      setScript(script);
    } catch (err) {
      showError(err);
    } finally {
      setScriptBusy(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    clearTimers();
    setError(null);
    resetResult();
    setIsDemo(false);
    setDemoId(null);
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
      const { highlights } = await postJson<{ highlights: Highlight[] }>("/api/highlights", { url: blob.url, lang: locale, targets });
      setHighlights(highlights);
      setStage("done");
      scrollTo("step-shorts");
    } catch (err) {
      showError(err);
      setStage("idle");
    }
  }

  const busy = stage === "uploading" || stage === "analyzing" || aiProgress !== null;
  const decorated = (deco.qr && /^https?:\/\/\S+\.\S+/.test(deco.url)) || (deco.phone && !!phone);
  const states: StepState[] = [
    script ? "done" : "active",
    busy ? "active" : videoUrl ? "done" : script ? "active" : "todo",
    highlights.length > 0 ? "done" : "todo",
    phone ? "done" : "todo",
    decorated ? "done" : "todo",
    posted ? "done" : "todo",
  ];
  const presetQa = DEMO_PRESETS.find((p) => p.id === demoId)?.qa ?? (videoUrl && videoUrl === AI_SAMPLE?.videoUrl ? AI_SAMPLE.qa : null);
  const shortDeco = decoFor("short", deco, phone);
  const siteUrl = decoFor("long", { ...deco, long: true }, null).qrUrl;
  // 숏폼 카드 언어: 고른 손님 나라 중 문구가 있는 언어만
  const shortLangs = targets.filter((l) => highlights.some((h) => hasHighlightText(h, l)));
  const activeLang = shortLangs.includes(shortsLang) ? shortsLang : (shortLangs[0] ?? locale);
  const sampleTitle = (p: DemoPreset) => t.samples[p.id as keyof StudioText["samples"]]?.title ?? p.title;

  return (
    <TextProvider value={t}>
    <main lang={locale} className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
      <Stepper states={states} labels={t.stepper} />

      <div className="pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-muted">{t.subtitle}</p>
        <p className="mt-6 text-sm font-medium">{t.samplesLabel}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {DEMO_PRESETS.map((p) => {
            const ready = READY_PRESETS.includes(p);
            const active = demoId === p.id;
            return (
              <button
                key={p.id}
                disabled={!ready || demoStep !== null || aiProgress !== null}
                onClick={() => runPreset(p)}
                className={
                  "min-h-11 rounded-xl border px-4 py-3 text-left disabled:opacity-50 " +
                  (active ? "border-foreground bg-line/40" : "border-line hover:border-foreground")
                }
              >
                <span className={"block font-mono text-xs " + (p.plan === "premium" ? "text-accent" : "text-muted")}>{t.planTags[p.plan]}</span>
                <span className="block font-medium">{sampleTitle(p)}</span>
                <span className="block text-sm text-muted">{ready ? (active ? t.sampleSelected : t.samplePlay) : t.sampleSoon}</span>
              </button>
            );
          })}
        </div>
        {demoStep !== null && (
          <ol className="mt-4 space-y-1.5 rounded-xl border border-line p-4 text-sm">
            {t.demoSteps[plan].map((label, i) => (
              <li key={label} className={i < demoStep ? "" : i === demoStep ? "text-accent" : "text-muted"}>
                {i < demoStep ? "✓" : i === demoStep ? "◉" : "○"} {label}
              </li>
            ))}
          </ol>
        )}
        {error && <p className="mt-4 rounded-xl border border-accent/40 px-4 py-3 text-sm text-accent">{error}</p>}
      </div>

      <Step id="step-script" n={1} title={t.steps.script}>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="self-center text-sm text-muted">{t.examplesLabel}</span>
          {t.examples.map((e, i) => (
            <button key={i} onClick={() => fillExample(i)} className="min-h-9 rounded-full border border-line px-3 text-sm hover:border-foreground">
              {e.product.split(",")[0]}
            </button>
          ))}
        </div>
        <form onSubmit={makeScript} className="space-y-3">
          <label className="block">
            <span className="text-sm text-muted">{t.productLabel}</span>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder={t.productPlaceholder} className={input} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-muted">{t.storeLabel}</span>
              <input value={store} onChange={(e) => setStore(e.target.value)} placeholder={t.storePlaceholder} className={input} />
            </label>
            <label className="block">
              <span className="text-sm text-muted">{t.audienceLabel}</span>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t.audiencePlaceholder} className={input} />
            </label>
          </div>
          <fieldset>
            <legend className="text-sm text-muted">{t.targetsLabel}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {LOCALES.map((l) => {
                const on = targets.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTarget(l)}
                    className={"min-h-11 rounded-full border px-3 text-sm " + (on ? "border-foreground bg-foreground text-background" : "border-line text-muted hover:border-foreground")}
                  >
                    {TARGET_FLAGS[l]} {t.countries[l]}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-muted">{t.targetsHint}</p>
          </fieldset>
          <button disabled={scriptBusy || !product.trim()} className={primary}>
            {scriptBusy ? t.scriptBusy : t.scriptCta}
          </button>
        </form>
        {script && (
          <div className="mt-6 space-y-3">
            <p className="font-medium">{script.title}</p>
            <p className="text-sm text-muted">{fill(t.viewer, { target: script.target })}</p>
            <ol className="space-y-3">
              {script.sections.map((s, i) => (
                <li key={i} className="rounded-xl border border-line p-4">
                  <p className="text-sm font-medium">
                    {i + 1}. {s.name} <span className="text-muted">{fill(t.minutes, { n: s.minutes })}</span>
                  </p>
                  <p className="mt-2 leading-relaxed">“{s.say}”</p>
                  <p className="mt-2 text-sm text-muted">{fill(t.screen, { show: s.show })}</p>
                </li>
              ))}
            </ol>
            {script.tips.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                {script.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Step>

      <Step id="step-upload" n={2} title={t.steps.video}>
        <div role="tablist" className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-line p-1">
          {(
            [
              { id: "lite", title: t.tabLite, tag: "Lite" },
              { id: "premium", title: t.tabPremium, tag: "Premium" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={plan === tab.id}
              disabled={busy}
              onClick={() => setPlan(tab.id)}
              className={"min-h-11 rounded-lg px-3 py-2 text-sm font-medium " + (plan === tab.id ? "bg-foreground text-background" : "text-muted hover:text-foreground")}
            >
              {tab.title}
              <span className={"block font-mono text-xs sm:ml-1.5 sm:inline " + (plan === tab.id ? "opacity-70" : tab.id === "premium" ? "text-accent" : "")}>{tab.tag}</span>
            </button>
          ))}
        </div>

        {plan === "lite" ? (
          <>
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
              <span className="font-medium">{dragging ? t.dropHere : t.dropPrompt}</span>
              <span className="text-sm text-muted">{t.dropHint}</span>
              <input type="file" accept="video/*,audio/*" className="hidden" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {stage === "uploading" && (
              <div className="mt-4">
                <p className="text-sm text-muted">{fill(t.uploading, { p: progress })}</p>
                <div className="mt-2 h-1.5 rounded-full bg-line">
                  <div className="h-1.5 rounded-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {stage === "analyzing" && (
              <ul className="mt-4 space-y-1.5 text-sm">
                <li>✓ {t.uploaded}</li>
                <li className={elapsed < 20 ? "text-accent" : ""}>{elapsed < 20 ? "◉" : "✓"} {t.transcribing}</li>
                <li className={elapsed < 20 ? "text-muted" : "text-accent"}>{elapsed < 20 ? "○" : "◉"} {t.picking}</li>
                <li className="pt-1 font-mono text-xs text-muted">{fill(t.elapsed, { t: fmt(elapsed) })}</li>
                {HAS_DEMO && (
                  <li>
                    <button onClick={showDemo} className="text-sm underline underline-offset-4">
                      {t.waitSample}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">
              {t.premiumLead} <MockBadge>{t.premiumBadge}</MockBadge>
            </p>
            <AiVideoPanel hasScript={!!script} progress={aiProgress} ready={!!videoUrl && isDemo && videoUrl === AI_SAMPLE?.videoUrl} onGenerate={runAiVideo} />
            {videoUrl && plan === "premium" && videoUrl === AI_SAMPLE?.videoUrl && (
              <div className="mt-5">
                <p className="mb-2 text-sm text-muted">
                  {t.aiDone} <MockBadge>{fill(t.aiSampleBadge, { title: sampleTitle(AI_SAMPLE) })}</MockBadge>
                </p>
                <video src={videoUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full max-w-xs rounded-xl bg-black" />
              </div>
            )}
          </>
        )}
      </Step>

      <Step id="step-shorts" n={3} title={t.steps.shorts}>
        {highlights.length === 0 ? (
          <p className="text-muted">{t.shortsEmpty}</p>
        ) : (
          <>
            {isDemo && (
              <p className="mb-3 inline-block rounded-full border border-line px-3 py-1 text-xs text-muted">
                {t.sampleResult}
              </p>
            )}
            {shortLangs.length > 1 && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">{t.shortsLang}</span>
                {shortLangs.map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={l === activeLang}
                    onClick={() => setShortsLang(l)}
                    className={"min-h-11 rounded-full border px-3 text-sm " + (l === activeLang ? "border-foreground bg-foreground text-background" : "border-line text-muted hover:border-foreground")}
                  >
                    {TARGET_FLAGS[l]} {t.countries[l]}
                  </button>
                ))}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((h, i) => (
                <ShortCard key={`${videoUrl}-${i}`} h={h} src={videoUrl!} lang={activeLang} ownerLang={locale} phone={shortDeco.phone} qrUrl={shortDeco.qrUrl} />
              ))}
            </div>
          </>
        )}
      </Step>

      <Step id="step-phone" n={4} title={t.steps.phone}>
        <PhoneStep product={product} presetQa={presetQa} phone={phone} onPhone={(n) => {
          setPhone(n);
          if (n) setDeco((d) => ({ ...d, phone: true }));
        }} />
      </Step>

      <Step id="step-deco" n={5} title={t.steps.deco}>
        <DecoStep deco={deco} onDeco={setDeco} phone={phone} videoUrl={videoUrl} />
      </Step>

      <Step id="step-sns" n={6} title={t.steps.sns}>
        <SnsStep key={videoUrl ?? "none"} highlights={highlights} siteUrl={siteUrl} onPosted={() => setPosted(true)} />
      </Step>
    </main>
    </TextProvider>
  );
}

function ShortCard({
  h,
  src,
  lang,
  ownerLang,
  phone,
  qrUrl,
}: {
  h: Highlight;
  src: string;
  lang: Locale; // 손님에게 보일 후킹·캡션 언어
  ownerLang: Locale; // 화면(사장님) 언어
  phone: string | null;
  qrUrl: string | null;
}) {
  const t = useT();
  const { hook, caption } = highlightText(h, lang);
  // 후킹 아래 작은 줄: 손님 언어면 사장님 언어 뜻을, 같으면 영어를 보여 준다.
  const sub = lang !== ownerLang ? highlightText(h, ownerLang).hook : ownerLang !== "en" ? h.hookEn : "";
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
    const extra = [phone && `📞 ${phone}`, qrUrl && `🔗 ${qrUrl}`].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(`${hook}\n\n${caption}${extra ? `\n\n${extra}` : ""}\n\n${h.hashtags.join(" ")}`);
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
          {hook}
          {sub && <span className="block text-xs font-normal opacity-80">{sub}</span>}
        </span>
        {!playing && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-xl text-black">▶</span>
          </span>
        )}
        <VideoOverlays phone={phone} qrUrl={qrUrl} belowHook />
        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-1 font-mono text-xs text-white">
          {fmt(h.start)}–{fmt(h.end)} · {fill(t.seconds, { n: Math.round(h.end - h.start) })}
        </span>
      </button>
      <div className="space-y-2 p-3 text-sm">
        <p className="font-medium">
          <span className="mr-1 text-accent">{t.why}</span>
          {highlightWhy(h, ownerLang)}
        </p>
        <p className="leading-relaxed">{caption}</p>
        <p className="text-muted">{h.hashtags.join(" ")}</p>
        <button onClick={copy} className="min-h-11 w-full rounded-lg border border-line hover:border-foreground">
          {copied ? t.copied : t.copy}
        </button>
      </div>
    </div>
  );
}
