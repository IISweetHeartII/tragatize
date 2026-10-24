"use client";

// 스튜디오의 «시연용» 단계들: AI 홍보 영상(Premium), 전화 응대, 영상 꾸미기, SNS 올리기.
// 실제 생성·발급·게시는 하지 않는다. 화면마다 «시연용» 배지를 붙여 미리 만든 결과임을 밝힌다.
import QRCode from "qrcode";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { QA } from "@/lib/demo";
import type { StudioText } from "@/lib/dict";
import { fill } from "@/lib/i18n";
import { ORDER_PHONE } from "@/lib/site";
import type { Highlight } from "@/lib/types";

export type Deco = { qr: boolean; url: string; phone: boolean; long: boolean; short: boolean };
export const NO_DECO: Deco = { qr: false, url: "", phone: false, long: true, short: true };

const input =
  "mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground";
const primary =
  "min-h-11 w-full rounded-xl bg-foreground px-6 py-3 font-medium text-background disabled:opacity-40 sm:w-auto";
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// 화면 문구(사전). StudioClient 가 TextProvider 로 내려 준다.
const TextContext = createContext<StudioText | null>(null);
export const TextProvider = TextContext.Provider;
export function useT(): StudioText {
  const t = useContext(TextContext);
  if (!t) throw new Error("TextProvider 가 없어요");
  return t;
}

export function MockBadge({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return <span className="inline-block rounded-full border border-line px-2 py-0.5 text-xs font-normal text-muted">{children ?? t.mock}</span>;
}

function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={"flex min-h-11 cursor-pointer items-center gap-3 " + (disabled ? "cursor-not-allowed opacity-40" : "")}>
      <input type="checkbox" className="peer sr-only" checked={on} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className={"relative h-6 w-10 shrink-0 rounded-full transition-colors " + (on ? "bg-foreground" : "bg-line")}>
        <span className={"absolute top-0.5 size-5 rounded-full bg-background shadow transition-all " + (on ? "left-[1.125rem]" : "left-0.5")} />
      </span>
      <span className="font-medium">{label}</span>
    </label>
  );
}

function QrImage({ value, className }: { value: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { margin: 1, width: 240, errorCorrectionLevel: "M" })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
  }, [value]);
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`QR: ${value}`} className={className} />;
}

// 영상 위에 얹는 전화번호·QR. 숏폼 카드와 롱폼 미리보기가 같이 쓴다.
// QR 은 오른쪽 위(숏폼은 후킹 문구 아래)에 둔다 — 영상 아래쪽 자막을 가리지 않게.
export function VideoOverlays({ phone, qrUrl, belowHook = false }: { phone: string | null; qrUrl: string | null; belowHook?: boolean }) {
  const t = useT();
  return (
    <>
      {qrUrl && (
        <span className={"absolute right-2 rounded-md bg-white p-0.5 shadow " + (belowHook ? "top-[5.5rem]" : "top-2")}>
          <QrImage value={qrUrl} className="size-10" />
          <span className="block text-center text-[8px] font-medium leading-tight text-black">{t.qrLabel}</span>
        </span>
      )}
      {phone && (
        <span className="absolute bottom-10 left-2 rounded-md bg-accent/90 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
          📞 {phone}
        </span>
      )}
    </>
  );
}

// ── Premium: AI 홍보 영상 만들기 ─────────────────────────────────────────────
export type AiTemplate = "avatar" | "persona" | "product";

const TEMPLATE_IDS: AiTemplate[] = ["avatar", "persona", "product"];
export const AI_STEP_COUNT = 5; // 사전의 aiSteps 개수

export function AiVideoPanel({
  hasScript,
  progress,
  ready,
  onGenerate,
}: {
  hasScript: boolean;
  progress: number | null; // aiSteps 중 진행 중인 단계, 없으면 null
  ready: boolean;
  onGenerate: () => void;
}) {
  const [template, setTemplate] = useState<AiTemplate>("persona");
  const t = useT();
  const [persona, setPersona] = useState(0);
  const [files, setFiles] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const busy = progress !== null;
  const canGo = files.length > 0 && (template !== "avatar" || consent) && !busy;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted">{t.templatesLabel}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {TEMPLATE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              disabled={busy}
              onClick={() => setTemplate(id)}
              className={"min-h-11 rounded-xl border px-4 py-3 text-left " + (template === id ? "border-foreground bg-line/40" : "border-line hover:border-foreground")}
            >
              <span className="block font-medium">{t.templates[id].title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{t.templates[id].body}</span>
            </button>
          ))}
        </div>
      </div>

      {template === "persona" && (
        <div>
          <p className="text-sm text-muted">{t.personaLabel}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.personas.map((p, i) => (
              <button
                key={p}
                type="button"
                disabled={busy}
                onClick={() => setPersona(i)}
                className={"min-h-11 rounded-full border px-4 text-sm " + (persona === i ? "border-foreground bg-foreground text-background" : "border-line hover:border-foreground")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm text-muted">{t.materialsLabel}</p>
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-4 py-6 text-center hover:border-foreground">
          <span className="font-medium">{t.pickFiles}</span>
          <span className="text-sm text-muted">{t.templates[template].need}</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
          />
        </label>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {files.map((f) => (
              <li key={f} className="truncate">
                ✓ {f}
              </li>
            ))}
            <li className="text-xs text-muted">{t.notUploaded}</li>
          </ul>
        )}
      </div>

      {template === "avatar" && (
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 size-4" checked={consent} disabled={busy} onChange={(e) => setConsent(e.target.checked)} />
          <span>{t.consent}</span>
        </label>
      )}

      {!hasScript && <p className="text-sm text-muted">{t.scriptFirst}</p>}

      <button type="button" disabled={!canGo} onClick={onGenerate} className={primary}>
        {busy ? t.aiBusy : ready ? t.aiAgain : t.aiCta}
      </button>

      {busy && (
        <ul className="space-y-1.5 text-sm">
          {t.aiSteps.map((s, i) => (
            <li key={s} className={i < progress ? "" : i === progress ? "text-accent" : "text-muted"}>
              {i < progress ? "✓" : i === progress ? "◉" : "○"} {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── 전화 응대 ────────────────────────────────────────────────────────────
function draftQa(product: string, d: StudioText["qaDraft"]): QA[] {
  const [name, ...rest] = product.split(",").map((s) => s.trim());
  const price = rest.join(", ");
  return [
    { q: d.priceQ, a: price ? fill(d.priceA, { name: name || d.productFallback, price }) : "" },
    { q: d.orderQ, a: d.orderA },
    { q: d.hoursQ, a: "" },
  ];
}

export function PhoneStep({
  product,
  presetQa,
  phone,
  onPhone,
}: {
  product: string;
  presetQa: QA[] | null;
  phone: string | null;
  onPhone: (n: string | null) => void;
}) {
  const t = useT();
  const [on, setOn] = useState(false);
  const [qa, setQa] = useState<QA[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [issuing, setIssuing] = useState(false);

  async function draft() {
    setDrafting(true);
    await sleep(1200);
    setQa(presetQa ?? draftQa(product, t.qaDraft));
    setDrafting(false);
  }
  async function issue() {
    setIssuing(true);
    await sleep(1600);
    // 시연용: 데모 번호(AI 티제가 실제로 받는 070)를 보여 준다.
    onPhone(ORDER_PHONE);
    setIssuing(false);
  }
  const edit = (i: number, k: keyof QA, v: string) => setQa((xs) => xs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const filled = qa.filter((x) => x.q.trim() && x.a.trim()).length;

  return (
    <div className="space-y-4">
      <Toggle
        on={on}
        onChange={(v) => {
          setOn(v);
          if (!v) onPhone(null);
        }}
        label={t.phoneToggle}
      />
      {!on ? (
        <p className="text-sm text-muted">{t.phoneOff}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">{t.qaLabel}</p>
            <button type="button" onClick={draft} disabled={drafting} className="min-h-11 rounded-full border border-line px-4 text-sm hover:border-foreground disabled:opacity-40">
              {drafting ? t.drafting : t.draftCta}
            </button>
          </div>
          <ol className="space-y-3">
            {qa.map((x, i) => (
              <li key={i} className="space-y-2 rounded-xl border border-line p-3">
                <input value={x.q} onChange={(e) => edit(i, "q", e.target.value)} placeholder={t.qPlaceholder} className={input + " mt-0 font-medium"} />
                <textarea
                  value={x.a}
                  onChange={(e) => edit(i, "a", e.target.value)}
                  placeholder={t.aPlaceholder}
                  rows={2}
                  className={input + " mt-0 resize-none"}
                />
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setQa((xs) => [...xs, { q: "", a: "" }])} className="min-h-11 text-sm underline underline-offset-4">
            {t.addQ}
          </button>
          <div className="rounded-xl border border-line p-4">
            {phone ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">
                    {t.myNumber} <MockBadge />
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-accent">{phone}</p>
                  <p className="mt-1 text-xs text-muted">{t.numberNote}</p>
                </div>
                <a href={`tel:${phone.replace(/-/g, "")}`} className="flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-medium hover:border-foreground">
                  {t.callTry}
                </a>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">{filled > 0 ? fill(t.qaCount, { n: filled }) : t.qaEmpty}</p>
                <button type="button" onClick={issue} disabled={filled === 0 || issuing} className={primary}>
                  {issuing ? t.issuing : t.issueCta}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── 영상 꾸미기 ───────────────────────────────────────────────────────────
export function DecoStep({ deco, onDeco, phone, videoUrl }: { deco: Deco; onDeco: (d: Deco) => void; phone: string | null; videoUrl: string | null }) {
  const t = useT();
  const set = (patch: Partial<Deco>) => onDeco({ ...deco, ...patch });
  const qrUrl = deco.qr && /^https?:\/\/\S+\.\S+/.test(deco.url) ? deco.url : null;
  const showPhone = deco.phone && phone ? phone : null;
  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_12rem]">
      <div className="space-y-4">
        <div>
          <Toggle on={deco.qr} onChange={(v) => set({ qr: v })} label={t.qrToggle} />
          {deco.qr && (
            <label className="block">
              <span className="text-sm text-muted">{t.siteLabel}</span>
              <input
                value={deco.url}
                onChange={(e) => set({ url: e.target.value })}
                inputMode="url"
                placeholder={t.sitePlaceholder}
                className={input}
              />
            </label>
          )}
        </div>
        <div>
          <Toggle on={deco.phone} onChange={(v) => set({ phone: v })} label={t.phoneOverlayToggle} disabled={!phone} />
          {!phone && <p className="text-sm text-muted">{t.phoneFirst}</p>}
        </div>
        <div>
          <p className="text-sm text-muted">{t.targetVideos}</p>
          <div className="mt-1 flex gap-4">
            {(["short", "long"] as const).map((k) => (
              <label key={k} className="flex min-h-11 cursor-pointer items-center gap-2">
                <input type="checkbox" className="size-4" checked={deco[k]} onChange={(e) => set({ [k]: e.target.checked })} />
                {k === "short" ? t.shortsTarget : t.longTarget}
              </label>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted">{t.decoNote}</p>
      </div>
      <div>
        <p className="mb-2 text-sm text-muted">{t.longPreview}</p>
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black">
          {videoUrl ? (
            <video src={`${videoUrl}#t=1`} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white/70">{t.longEmpty}</span>
          )}
          {deco.long && <VideoOverlays phone={showPhone} qrUrl={qrUrl} />}
        </div>
      </div>
    </div>
  );
}

export function decoFor(target: "short" | "long", deco: Deco, phone: string | null): { phone: string | null; qrUrl: string | null } {
  if (!deco[target]) return { phone: null, qrUrl: null };
  return {
    phone: deco.phone && phone ? phone : null,
    qrUrl: deco.qr && /^https?:\/\/\S+\.\S+/.test(deco.url) ? deco.url : null,
  };
}

// ── SNS 올리기 ───────────────────────────────────────────────────────────
const CHANNELS = [
  { id: "instagram", handle: "@my_store" },
  { id: "youtube", handle: "My Store" },
  { id: "tiktok", handle: "@my_store" },
] as const;
type ChannelId = (typeof CHANNELS)[number]["id"];
type ConnState = "off" | "connecting" | "on";

export function SnsStep({ highlights, siteUrl, onPosted }: { highlights: Highlight[]; siteUrl: string | null; onPosted: () => void }) {
  const t = useT();
  const [conn, setConn] = useState<Record<ChannelId, ConnState>>({ instagram: "off", youtube: "off", tiktok: "off" });
  const [picked, setPicked] = useState<boolean[]>([true, true, true, false]); // 숏폼 3개 + 롱폼
  const [link, setLink] = useState(true);
  const [posting, setPosting] = useState<number | null>(null); // 올린 개수
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const items = [...highlights.map((h, i) => fill(t.shortItem, { i: i + 1, hook: h.hook })), t.longItem];
  const connected = CHANNELS.filter((c) => conn[c.id] === "on");
  const jobs = items
    .map((label, i) => ({ label, i }))
    .filter(({ i }) => picked[i])
    .flatMap(({ label, i }) =>
      connected
        .filter((c) => (i === items.length - 1 ? c.id === "youtube" : true))
        .map((c) => `${t.channels[c.id].short} · ${label}`),
    );

  function connect(id: ChannelId) {
    setConn((s) => ({ ...s, [id]: "connecting" }));
    timers.current.push(setTimeout(() => setConn((s) => ({ ...s, [id]: "on" })), 1100));
  }
  function post() {
    setDone(false);
    setPosting(0);
    jobs.forEach((_, i) =>
      timers.current.push(
        setTimeout(() => {
          setPosting(i + 1);
          if (i === jobs.length - 1) {
            setDone(true);
            onPosted();
          }
        }, 700 * (i + 1)),
      ),
    );
  }

  if (highlights.length === 0) return <p className="text-muted">{t.snsEmpty}</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted">
          {t.channelsLabel} <MockBadge />
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {CHANNELS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={conn[c.id] !== "off"}
                onClick={() => connect(c.id)}
                className={"min-h-11 w-full rounded-xl border px-4 py-3 text-left " + (conn[c.id] === "on" ? "border-foreground" : "border-line hover:border-foreground")}
              >
                <span className="block font-medium">{t.channels[c.id].label}</span>
                <span className="block text-sm text-muted">
                  {conn[c.id] === "on" ? fill(t.connected, { handle: c.handle }) : conn[c.id] === "connecting" ? t.connecting : t.connect}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm text-muted">{t.postItems}</p>
        <ul className="mt-1">
          {items.map((label, i) => (
            <li key={label}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input type="checkbox" className="size-4" checked={picked[i]} onChange={(e) => setPicked((p) => p.map((x, j) => (j === i ? e.target.checked : x)))} />
                <span className="truncate">{label}</span>
              </label>
            </li>
          ))}
        </ul>
        <label className={"flex min-h-11 items-center gap-3 " + (siteUrl ? "cursor-pointer" : "opacity-40")}>
          <input type="checkbox" className="size-4" checked={link && !!siteUrl} disabled={!siteUrl} onChange={(e) => setLink(e.target.checked)} />
          <span>{t.linkInCaption}{siteUrl ? "" : t.linkNeedsSite}</span>
        </label>
        <p className="text-xs text-muted">{t.igNote}</p>
      </div>
      <button type="button" disabled={jobs.length === 0 || (posting !== null && !done)} onClick={post} className={primary}>
        {connected.length === 0 ? t.connectFirst : fill(t.postCta, { n: jobs.length })}
      </button>
      {posting !== null && (
        <ul className="space-y-1.5 rounded-xl border border-line p-4 text-sm">
          {jobs.map((j, i) => (
            <li key={j} className={i < posting ? "" : i === posting ? "text-accent" : "text-muted"}>
              {i < posting ? t.posted : i === posting ? t.posting : t.waiting} · {j}
            </li>
          ))}
          {done && (
            <li className="pt-2 text-muted">
              <MockBadge /> {t.notReallyPosted}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
