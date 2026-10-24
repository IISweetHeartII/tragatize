import Link from "next/link";
import { DEMO_PRESETS } from "@/lib/demo";
import type { Dict } from "@/lib/dict";
import { fill, highlightText, highlightWhy, localePath, type Locale } from "@/lib/i18n";
import { DEMO_VIDEO, ORDER_PHONE } from "@/lib/site";

// 랜딩 본문. 문구는 사전(src/lib/dict/*.json)에서, 구조·링크·숫자는 여기서.
const MEMBERS = ["김해청", "김덕환", "김성재", "윤정민"];

const DEMO = DEMO_PRESETS[0];

const primary =
  "flex min-h-11 items-center justify-center rounded-xl bg-foreground px-6 py-3 text-center font-medium text-background";
const secondary =
  "flex min-h-11 items-center justify-center rounded-xl border border-line px-6 py-3 text-center font-medium hover:border-foreground";

const OPTIONAL_STEPS = [false, false, false, true, true, true];

// 가격은 docs/business.md §2 추천안(C 혼합) 금액을 Lite·Premium 으로 옮긴 것. QR·SNS·전화 응대는 포함(켜고 끄는 선택).
const PLAN_META = [
  { name: "Lite", main: false, href: "/studio" },
  { name: "Premium", main: true, href: "/studio?plan=premium" },
];

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{title}</h2>
    </div>
  );
}

export function Landing({ locale, dict }: { locale: Locale; dict: Dict }) {
  const d = dict.landing;
  const href = (path: string) => localePath(locale, path);
  const demoProduct = dict.samples[DEMO.id as keyof Dict["samples"]]?.product ?? DEMO.product;
  return (
    <main lang={locale} className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
      <section className="py-12 sm:py-20">
        <p className="mb-4 inline-block rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">{d.badge}</p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          {d.heroLine1}
          <br />
          {d.heroLine2}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{d.heroSub}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={href("/studio?demo=1")} className={primary}>
            {d.ctaSample}
          </Link>
          <Link href={href("/studio")} className={secondary}>
            {d.ctaTry}
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted">{d.ctaNote}</p>
        <a
          href={`tel:${ORDER_PHONE.replace(/-/g, "")}`}
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-accent bg-accent/5 px-5 py-4"
        >
          <span>
            <span className="block text-sm text-muted">{d.callLead}</span>
            <span className="mt-0.5 block font-mono text-xl font-semibold text-accent">📞 {ORDER_PHONE}</span>
          </span>
          <span className="shrink-0 text-sm font-medium">{d.callCta}</span>
        </a>
      </section>

      <section className="pb-12 sm:pb-16">
        <p className="mb-3 font-mono text-xs text-accent">{d.demoLabel}</p>
        <video
          src={DEMO_VIDEO.src}
          poster={DEMO_VIDEO.poster}
          controls
          playsInline
          preload="none"
          className="aspect-video w-full rounded-xl border border-line bg-foreground"
        />
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow={d.painsEyebrow} title={d.painsTitle} />
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {d.pains.map((p) => (
            <li key={p.label} className="rounded-xl border border-line p-5">
              <p className="text-sm text-muted">{p.label}</p>
              <p className="mt-1 text-2xl font-semibold">{p.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow={d.stepsEyebrow} title={d.stepsTitle} />
        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {d.steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-xl border border-line p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                {i + 1}
              </span>
              <div>
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {s.title}
                  {OPTIONAL_STEPS[i] && <span className="rounded-full border border-line px-2 py-0.5 text-xs font-normal text-muted">{d.optional}</span>}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow={d.edgesEyebrow} title={d.edgesTitle} />
        <ul className="mt-8 grid gap-3">
          {d.edges.map((e, i) => (
            <li key={e.title} className={"rounded-xl border p-5 " + (i === d.edges.length - 1 ? "border-foreground" : "border-line")}>
              <p className="font-semibold">{e.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{e.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {DEMO && DEMO.highlights.length > 0 && (
        <section className="border-t border-line py-12 sm:py-16">
          <SectionTitle eyebrow={d.resultEyebrow} title={fill(d.resultTitle, { product: demoProduct })} />
          <p className="mt-3 text-sm text-muted">{d.resultNote}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {DEMO.highlights.slice(0, 3).map((h) => (
              <li key={h.start} className="overflow-hidden rounded-xl border border-line">
                <div className="relative aspect-[9/16] max-h-80 w-full bg-black sm:max-h-none">
                  <video
                    src={`${DEMO.videoUrl}#t=${h.start}`}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover opacity-80"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-white">
                    <p className="font-mono text-xs opacity-80">
                      {fmt(h.start)}–{fmt(h.end)}
                    </p>
                    <p className="mt-1 text-lg font-semibold leading-snug">{highlightText(h, locale).hook}</p>
                    {locale === "ko" && <p className="mt-0.5 text-sm opacity-90">{h.hookEn}</p>}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-accent">{d.whyLabel}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{highlightWhy(h, locale)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link href={href("/studio?demo=1")} className={primary + " sm:inline-flex"}>
              {d.resultCta}
            </Link>
          </div>
        </section>
      )}

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow={d.pricingEyebrow} title={d.pricingTitle} />
        <p className="mt-3 text-sm text-muted">{d.pricingNote}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PLAN_META.map((meta, i) => {
            const p = d.plans[i];
            return (
              <div key={meta.name} className={"rounded-xl p-5 " + (meta.main ? "border-2 border-foreground" : "border border-line")}>
                <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                  {meta.name}
                  {meta.main && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">{d.recommended}</span>}
                </p>
                <p className="mt-1 font-medium">{p.tagline}</p>
                <p className="mt-2 text-3xl font-semibold">{p.price}</p>
                <p className="mt-1 text-sm text-muted">{p.priceNote}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {p.items.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
                <Link href={href(meta.href)} className={(meta.main ? primary : secondary) + " mt-5"}>
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">{d.pricingFoot}</p>
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow={d.faqEyebrow} title={d.faqTitle} />
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {d.faqs.map((f) => (
            <li key={f.q}>
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                  {f.q}
                  <span className="shrink-0 text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-12 text-center sm:py-20">
        <h2 className="text-2xl font-semibold leading-snug tracking-tight sm:text-4xl">
          {d.closingLine1}
          <br />
          {d.closingLine2}
        </h2>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={href("/studio?demo=1")} className={primary}>
            {d.ctaSample}
          </Link>
          <Link href={href("/studio")} className={secondary}>
            {d.ctaTry}
          </Link>
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li className="font-medium text-foreground">{d.team}</li>
          {MEMBERS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <a
          href="https://github.com/IISweetHeartII/tragatize"
          className="inline-flex min-h-11 items-center font-mono text-xs underline-offset-4 hover:text-foreground hover:underline"
        >
          github.com/IISweetHeartII/tragatize
        </a>
      </footer>
    </main>
  );
}
