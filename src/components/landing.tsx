import Link from "next/link";
import type { ReactNode } from "react";
import { DEMO_PRESETS } from "@/lib/demo";
import type { Dict } from "@/lib/dict";
import { fill, highlightText, highlightWhy, localePath, type Locale } from "@/lib/i18n";
import { ORDER_PHONE } from "@/lib/site";
import { DemoVideos } from "@/components/demo-videos";
import { LoopVideo } from "@/components/loop-video";

// 랜딩 본문. 문구는 사전(src/lib/dict/*.json)에서, 구조·링크·숫자는 여기서.
// 디자인 참고: ploy.ai(lapa.ninja AI·Marketing) — 시네마틱 히어로, 압축 대문자 큰 제목, 흰 패널+세로 구분선, 다크 라운드 푸터.
const MEMBERS = ["김해청", "김덕환", "김성재", "윤정민"];

const DEMO = DEMO_PRESETS[0];
// 히어로 폰 화면: AI 가 만든 니트 가디건 홍보 영상(Premium 샘플)
const HERO = DEMO_PRESETS.find((p) => p.id === "knit") ?? DEMO;
// 앞부분(0~11초)엔 얼굴 없이 몸통만 잡힌 클로즈업이 있어 그 뒤부터 반복한다
const HERO_START = 11.2;

// 띠 배너: 숏폼 문구를 만드는 7개 언어 인사말 + 올리는 곳
const MARQUEE = [
  "🇰🇷 안녕하세요",
  "🇺🇸 Hello",
  "🇯🇵 こんにちは",
  "🇨🇳 你好",
  "🇹🇼 您好",
  "🇻🇳 Xin chào",
  "🇹🇭 สวัสดี",
  "Instagram Reels",
  "YouTube Shorts",
  "TikTok",
  "📞 AI Call 070",
];

const OPTIONAL_STEPS = [false, false, false, true, true, true];

// 가격·포함 내역은 docs/business.md «요금제별 매출총이익» 표(Basic·Lite·Premium)를 옮긴 것. 전화 응대는 Premium 만.
const PLAN_META = [
  { name: "Basic", main: false, href: "/studio" },
  { name: "Lite", main: false, href: "/studio?plan=premium" },
  { name: "Premium", main: true, href: "/studio?plan=premium" },
];

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold " + (dark ? "bg-white text-foreground" : "bg-foreground text-background")
      }
    >
      {children}
    </p>
  );
}

function SectionTitle({ eyebrow, title, center = false }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className={"mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl " + (center ? "mx-auto" : "")}>{title}</h2>
    </div>
  );
}

const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export function Landing({ locale, dict }: { locale: Locale; dict: Dict }) {
  const d = dict.landing;
  const href = (path: string) => localePath(locale, path);
  const demoProduct = dict.samples[DEMO.id as keyof Dict["samples"]]?.product ?? DEMO.product;
  const heroHook = HERO.highlights[0] ? highlightText(HERO.highlights[0], locale).hook : "";
  const edgesLast = d.edges.length - 1;
  return (
    <main lang={locale} className="flex w-full flex-1 flex-col overflow-x-clip">
      {/* 히어로: AI 홍보 영상을 흐리게 깐 시네마틱 카드 + 큰 압축 제목 + 폰 화면 */}
      <section className="px-2 sm:px-3">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#120f0c] text-white">
          <LoopVideo
            src={HERO.videoUrl}
            start={HERO_START}
            className="absolute inset-0 -z-10 size-full scale-125 object-cover opacity-60 blur-2xl"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-14 pb-12 sm:px-10 sm:pt-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6 lg:pb-20">
            <div>
              <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                {d.badge}
              </p>
              <h1 className="font-display mt-6 text-[9.5vw] leading-[1.15] sm:text-6xl lg:text-[4.25rem]">
                <span className="block text-balance text-white/55">{d.heroLine1}</span>
                <span className="block text-balance">{d.heroLine2}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{d.heroSub}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={href("/studio?demo=1")}
                  className="flex min-h-12 items-center justify-center rounded-full bg-white px-7 font-semibold text-[#120f0c] hover:bg-white/90"
                >
                  {d.ctaSample}
                </Link>
                <Link
                  href={href("/studio")}
                  className="flex min-h-12 items-center justify-center rounded-full border border-white/40 px-7 font-semibold hover:bg-white/10"
                >
                  {d.ctaTry}
                </Link>
              </div>
              <p className="mt-3 text-sm text-white/60">{d.ctaNote}</p>
            </div>

            <div className="relative mx-auto w-[min(72vw,280px)]">
              <div className="relative aspect-[9/16] overflow-hidden rounded-[2.25rem] border-[7px] border-black bg-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/20">
                <LoopVideo src={HERO.videoUrl} start={HERO_START} className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-16">
                  <p className="text-xs font-semibold text-white/70">AI Shorts</p>
                  <p className="mt-1 text-lg font-bold leading-snug">{heroHook}</p>
                </div>
              </div>
              <a
                href={`tel:${ORDER_PHONE.replace(/-/g, "")}`}
                className="absolute -bottom-5 left-1/2 flex min-h-11 w-max -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-sm font-semibold text-white shadow-lg lg:top-10 lg:bottom-auto lg:-left-10 lg:translate-x-0"
              >
                📞 {ORDER_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 띠 배너: 7개 언어·올리는 곳 */}
      <section aria-hidden className="overflow-hidden py-8">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-lg font-semibold text-muted">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </section>

      {/* 전화 걸어 보기 */}
      <section className={wrap}>
        <a
          href={`tel:${ORDER_PHONE.replace(/-/g, "")}`}
          className="flex flex-col gap-3 rounded-[24px] bg-white p-6 ring-1 ring-line hover:ring-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <span>
            <span className="block text-sm text-muted">{d.callLead}</span>
            <span className="font-display mt-2 block text-3xl text-accent sm:text-4xl">{ORDER_PHONE}</span>
          </span>
          <span className="flex min-h-12 w-fit items-center rounded-full bg-accent px-6 font-semibold text-white">{d.callCta}</span>
        </a>
      </section>

      {/* 데모 영상 */}
      <section className={wrap + " py-16 sm:py-24"}>
        <DemoVideos label={d.demoLabel} tabs={dict.planTags} />
      </section>

      {/* 문제: 큰 숫자 3칸 */}
      <section className={wrap + " pb-16 sm:pb-24"}>
        <SectionTitle eyebrow={d.painsEyebrow} title={d.painsTitle} />
        <ul className="mt-10 grid overflow-hidden rounded-[24px] bg-white ring-1 ring-line sm:grid-cols-3">
          {d.pains.map((p, i) => (
            <li key={p.label} className={"p-6 sm:p-8 " + (i > 0 ? "border-t border-line sm:border-t-0 sm:border-l" : "")}>
              <p className="text-sm font-medium text-muted">{p.label}</p>
              <p className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{p.value}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 차별점: 초대형 문장 + 2x2 패널 */}
      <section className={wrap + " pb-16 sm:pb-24"}>
        <div className="text-center">
          <Eyebrow>{d.edgesEyebrow}</Eyebrow>
          <h2 className="font-display mx-auto mt-6 max-w-4xl text-balance text-[9vw] leading-[1.15] sm:text-5xl lg:text-6xl">{d.edgesTitle}</h2>
        </div>
        <ul className="mt-12 grid overflow-hidden rounded-[24px] bg-white ring-1 ring-line md:grid-cols-2">
          {d.edges.map((e, i) => (
            <li
              key={e.title}
              className={
                "p-6 sm:p-8 " +
                (i > 0 ? "border-t border-line " : "") +
                (i === 1 ? "md:border-t-0 md:border-l " : "") +
                (i === 3 ? "md:border-l " : "") +
                (i === edgesLast ? "bg-foreground text-background" : "")
              }
            >
              <p className="font-display text-2xl leading-none text-accent">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-4 text-xl font-semibold tracking-tight">{e.title}</p>
              <p className={"mt-2 text-sm leading-relaxed " + (i === edgesLast ? "text-background/70" : "text-muted")}>{e.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 작동 방식: 6단계 패널 */}
      <section className={wrap + " pb-16 sm:pb-24"}>
        <SectionTitle eyebrow={d.stepsEyebrow} title={d.stepsTitle} />
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[24px] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
          {d.steps.map((s, i) => (
            <li key={s.title} className="bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-3xl leading-none text-muted">{String(i + 1).padStart(2, "0")}</span>
                {OPTIONAL_STEPS[i] && <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">{d.optional}</span>}
              </div>
              <p className="mt-6 text-lg font-semibold">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 결과 예시: 다크 카드 + 자동 반복 숏폼 3개 */}
      {DEMO && DEMO.highlights.length > 0 && (
        <section className="px-2 pb-16 sm:px-3 sm:pb-24">
          <div className="rounded-[28px] bg-[#120f0c] py-14 text-white sm:py-20">
            <div className={wrap}>
              <Eyebrow dark>{d.resultEyebrow}</Eyebrow>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {fill(d.resultTitle, { product: demoProduct })}
              </h2>
              <p className="mt-3 text-sm text-white/60">{d.resultNote}</p>
              <ul className="mt-10 grid gap-4 sm:grid-cols-3">
                {DEMO.highlights.slice(0, 3).map((h) => (
                  <li key={h.start} className="overflow-hidden rounded-[20px] bg-white/5 ring-1 ring-white/10">
                    <div className="relative aspect-[9/16] max-h-[28rem] w-full bg-black sm:aspect-[3/4] sm:max-h-none">
                      <LoopVideo src={DEMO.videoUrl} start={h.start} end={h.end} className="absolute inset-0 size-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-16">
                        <p className="font-mono text-xs text-white/70">
                          {fmt(h.start)}–{fmt(h.end)}
                        </p>
                        <p className="mt-1 text-lg font-bold leading-snug">{highlightText(h, locale).hook}</p>
                        {locale === "ko" && <p className="mt-0.5 text-sm text-white/80">{h.hookEn}</p>}
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-accent">{d.whyLabel}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">{highlightWhy(h, locale)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href={href("/studio?demo=1")}
                  className="flex min-h-12 items-center justify-center rounded-full bg-white px-7 font-semibold text-[#120f0c] hover:bg-white/90 sm:inline-flex"
                >
                  {d.resultCta} →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 가격 */}
      <section className={wrap + " pb-16 sm:pb-24"}>
        <SectionTitle eyebrow={d.pricingEyebrow} title={d.pricingTitle} />
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{d.pricingNote}</p>
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {PLAN_META.map((meta, i) => {
            const p = d.plans[i];
            return (
              <div
                key={meta.name}
                className={
                  "flex flex-col rounded-[24px] p-6 sm:p-8 " +
                  (meta.main ? "bg-foreground text-background shadow-[0_30px_60px_-30px_rgba(22,19,15,0.6)]" : "bg-white ring-1 ring-line")
                }
              >
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {meta.name}
                  {meta.main && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">{d.recommended}</span>}
                </p>
                <p className={"mt-1 text-sm " + (meta.main ? "text-background/70" : "text-muted")}>{p.tagline}</p>
                <p className="font-display mt-6 whitespace-nowrap text-4xl leading-none">{p.price}</p>
                <p className={"mt-2 text-sm " + (meta.main ? "text-background/60" : "text-muted")}>{p.priceNote}</p>
                <ul className={"mt-6 mb-8 space-y-2 border-t pt-6 text-sm " + (meta.main ? "border-background/15" : "border-line")}>
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-accent">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={href(meta.href)}
                  className={
                    "mt-auto flex min-h-12 items-center justify-center rounded-full px-6 text-center font-semibold " +
                    (meta.main ? "bg-white text-foreground hover:bg-white/90" : "bg-foreground text-background hover:bg-foreground/85")
                  }
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted">{d.pricingFoot}</p>
      </section>

      {/* FAQ */}
      <section className={wrap + " grid gap-8 pb-16 sm:pb-24 lg:grid-cols-[0.8fr_1.2fr]"}>
        <SectionTitle eyebrow={d.faqEyebrow} title={d.faqTitle} />
        <ul className="divide-y divide-line overflow-hidden rounded-[24px] bg-white px-6 ring-1 ring-line">
          {d.faqs.map((f) => (
            <li key={f.q}>
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold">
                  {f.q}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      {/* 마무리 + 푸터: 다크 라운드 카드 */}
      <section className="px-2 pb-2 sm:px-3 sm:pb-3">
        <div className="rounded-[28px] bg-[#120f0c] text-white">
          <div className={wrap + " py-16 text-center sm:py-24"}>
            <h2 className="font-display text-[9vw] leading-[1.15] sm:text-5xl lg:text-6xl">
              <span className="block text-balance text-white/45">{d.closingLine1}</span>
              <span className="block text-balance">{d.closingLine2}</span>
            </h2>
            <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={href("/studio?demo=1")}
                className="flex min-h-12 items-center justify-center rounded-full bg-white px-7 font-semibold text-[#120f0c] hover:bg-white/90"
              >
                {d.ctaSample}
              </Link>
              <Link
                href={href("/studio")}
                className="flex min-h-12 items-center justify-center rounded-full border border-white/40 px-7 font-semibold hover:bg-white/10"
              >
                {d.ctaTry}
              </Link>
            </div>
          </div>
          <footer className={wrap + " flex flex-col gap-4 border-t border-white/10 py-8 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between"}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              <li className="font-semibold text-white">{d.team}</li>
              {MEMBERS.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <a
              href="https://github.com/IISweetHeartII/tragatize"
              className="inline-flex min-h-11 items-center font-mono text-xs underline-offset-4 hover:text-white hover:underline"
            >
              github.com/IISweetHeartII/tragatize
            </a>
          </footer>
        </div>
      </section>
    </main>
  );
}
