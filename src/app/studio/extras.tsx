"use client";

// 스튜디오의 «시연용» 단계들: AI 홍보 영상(Premium), 전화 응대, 영상 꾸미기, SNS 올리기.
// 실제 생성·발급·게시는 하지 않는다. 화면마다 «시연용» 배지를 붙여 미리 만든 결과임을 밝힌다.
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import type { QA } from "@/lib/demo";
import { ORDER_PHONE } from "@/lib/site";
import type { Highlight } from "@/lib/types";

export type Deco = { qr: boolean; url: string; phone: boolean; long: boolean; short: boolean };
export const NO_DECO: Deco = { qr: false, url: "", phone: false, long: true, short: true };

const input =
  "mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground";
const primary =
  "min-h-11 w-full rounded-xl bg-foreground px-6 py-3 font-medium text-background disabled:opacity-40 sm:w-auto";
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function MockBadge({ children = "시연용" }: { children?: React.ReactNode }) {
  return <span className="inline-block rounded-full border border-line px-2 py-0.5 text-xs font-normal text-muted">{children}</span>;
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
  return (
    <>
      {qrUrl && (
        <span className={"absolute right-3 rounded-lg bg-white p-1 shadow " + (belowHook ? "top-[5.5rem]" : "top-3")}>
          <QrImage value={qrUrl} className="size-16" />
          <span className="block text-center text-[10px] font-medium text-black">제품 보기</span>
        </span>
      )}
      {phone && (
        <span className="absolute inset-x-3 bottom-12 rounded-lg bg-accent px-3 py-2 text-white">
          <span className="block text-xs opacity-90">📞 전화 주문 · Call to order</span>
          <span className="block font-mono text-base font-semibold">{phone}</span>
        </span>
      )}
    </>
  );
}

// ── Premium: AI 홍보 영상 만들기 ─────────────────────────────────────────────
export type AiTemplate = "avatar" | "persona" | "product";

const TEMPLATES: { id: AiTemplate; title: string; body: string; need: string }[] = [
  { id: "avatar", title: "내 얼굴 아바타", body: "사장님 사진·영상으로 만든 AI 아바타가 대본대로 소개해요.", need: "얼굴 정면 사진 3장 + 10초 이상 말하는 영상 1개, 제품 사진" },
  { id: "persona", title: "AI 페르소나", body: "원하는 진행자·등장인물을 골라 대본대로 소개해요.", need: "제품 사진·영상 3~5개 (진행자는 고른 페르소나로)" },
  { id: "product", title: "제품만", body: "사람 없이 제품 사진·영상으로 광고 영상을 만들어요.", need: "제품 사진·영상 3~5개" },
];
const PERSONAS = ["다정한 가족 이야기", "친근한 20대 크리에이터", "차분한 쇼호스트", "외국인 여행 유튜버"];
export const AI_STEPS = ["올린 자료 분석", "대본에 맞춰 장면 구성", "장면 영상 생성", "목소리·자막 입히기", "숏폼으로 자르기"];

export function AiVideoPanel({
  hasScript,
  progress,
  ready,
  onGenerate,
}: {
  hasScript: boolean;
  progress: number | null; // AI_STEPS 중 진행 중인 단계, 없으면 null
  ready: boolean;
  onGenerate: () => void;
}) {
  const [template, setTemplate] = useState<AiTemplate>("persona");
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [files, setFiles] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const t = TEMPLATES.find((x) => x.id === template)!;
  const busy = progress !== null;
  const canGo = files.length > 0 && (template !== "avatar" || consent) && !busy;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted">홍보 영상 템플릿</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {TEMPLATES.map((x) => (
            <button
              key={x.id}
              type="button"
              disabled={busy}
              onClick={() => setTemplate(x.id)}
              className={"min-h-11 rounded-xl border px-4 py-3 text-left " + (template === x.id ? "border-foreground bg-line/40" : "border-line hover:border-foreground")}
            >
              <span className="block font-medium">{x.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{x.body}</span>
            </button>
          ))}
        </div>
      </div>

      {template === "persona" && (
        <div>
          <p className="text-sm text-muted">페르소나</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy}
                onClick={() => setPersona(p)}
                className={"min-h-11 rounded-full border px-4 text-sm " + (persona === p ? "border-foreground bg-foreground text-background" : "border-line hover:border-foreground")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm text-muted">AI 가 배울 자료 올리기</p>
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-4 py-6 text-center hover:border-foreground">
          <span className="font-medium">사진·영상 고르기</span>
          <span className="text-sm text-muted">{t.need}</span>
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
            <li className="text-xs text-muted">시연용이라 파일은 서버로 올리지 않아요.</li>
          </ul>
        )}
      </div>

      {template === "avatar" && (
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 size-4" checked={consent} disabled={busy} onChange={(e) => setConsent(e.target.checked)} />
          <span>제 얼굴과 목소리로 AI 영상을 만드는 데 동의해요. 만든 영상에는 «AI 생성» 표시가 붙어요.</span>
        </label>
      )}

      {!hasScript && <p className="text-sm text-muted">1단계에서 대본을 받으면 그 대본대로 영상을 만들어요.</p>}

      <button type="button" disabled={!canGo} onClick={onGenerate} className={primary}>
        {busy ? "AI 홍보 영상 만드는 중…" : ready ? "다시 만들기" : "AI 홍보 영상 만들기"}
      </button>

      {busy && (
        <ul className="space-y-1.5 text-sm">
          {AI_STEPS.map((s, i) => (
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
function draftQa(product: string): QA[] {
  const [name, ...rest] = product.split(",").map((s) => s.trim());
  const price = rest.join(", ");
  return [
    { q: "가격이 얼마예요?", a: price ? `${name || "상품"} 가격은 ${price}이에요.` : "" },
    { q: "어떻게 주문해요?", a: "원하시는 상품을 말씀해 주시면 주문 확인 문자를 보내 드려요. 주소는 문자로 답장해 주세요." },
    { q: "영업시간·위치가 어떻게 돼요?", a: "" },
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
  const [on, setOn] = useState(false);
  const [qa, setQa] = useState<QA[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [issuing, setIssuing] = useState(false);

  async function draft() {
    setDrafting(true);
    await sleep(1200);
    setQa(presetQa ?? draftQa(product));
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
        label="AI 판매원 «티제» 전화 응대 켜기"
      />
      {!on ? (
        <p className="text-sm text-muted">켜면 손님이 자주 묻는 질문의 답을 적고 내 가게 전용 070 번호를 받아요. 숏폼을 본 손님의 전화를 AI 가 받아 주문까지 접수해요.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">질문·답변 리스트 (AI 가 이대로 답해요)</p>
            <button type="button" onClick={draft} disabled={drafting} className="min-h-11 rounded-full border border-line px-4 text-sm hover:border-foreground disabled:opacity-40">
              {drafting ? "초안 쓰는 중…" : "✨ AI 로 초안 만들기"}
            </button>
          </div>
          <ol className="space-y-3">
            {qa.map((x, i) => (
              <li key={i} className="space-y-2 rounded-xl border border-line p-3">
                <input value={x.q} onChange={(e) => edit(i, "q", e.target.value)} placeholder="손님 질문" className={input + " mt-0 font-medium"} />
                <textarea
                  value={x.a}
                  onChange={(e) => edit(i, "a", e.target.value)}
                  placeholder="답변을 적어 주세요"
                  rows={2}
                  className={input + " mt-0 resize-none"}
                />
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setQa((xs) => [...xs, { q: "", a: "" }])} className="min-h-11 text-sm underline underline-offset-4">
            + 질문 추가
          </button>
          <div className="rounded-xl border border-line p-4">
            {phone ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">
                    내 가게 전화번호 <MockBadge />
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-accent">{phone}</p>
                  <p className="mt-1 text-xs text-muted">시연용으로 데모 번호를 보여 드려요. 실제로 걸면 AI 티제가 받아요.</p>
                </div>
                <a href={`tel:${phone.replace(/-/g, "")}`} className="flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-medium hover:border-foreground">
                  걸어 보기 →
                </a>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">{filled > 0 ? `질문 ${filled}개로 AI 판매원을 만들어요.` : "질문·답변을 하나 이상 채워 주세요."}</p>
                <button type="button" onClick={issue} disabled={filled === 0 || issuing} className={primary}>
                  {issuing ? "번호 받는 중…" : "070 번호 받기"}
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
  const set = (patch: Partial<Deco>) => onDeco({ ...deco, ...patch });
  const qrUrl = deco.qr && /^https?:\/\/\S+\.\S+/.test(deco.url) ? deco.url : null;
  const showPhone = deco.phone && phone ? phone : null;
  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_12rem]">
      <div className="space-y-4">
        <div>
          <Toggle on={deco.qr} onChange={(v) => set({ qr: v })} label="QR 코드 넣기 (내 제품 사이트)" />
          {deco.qr && (
            <label className="block">
              <span className="text-sm text-muted">제품 사이트 주소</span>
              <input
                value={deco.url}
                onChange={(e) => set({ url: e.target.value })}
                inputMode="url"
                placeholder="https://smartstore.naver.com/내가게"
                className={input}
              />
            </label>
          )}
        </div>
        <div>
          <Toggle on={deco.phone} onChange={(v) => set({ phone: v })} label="전화 주문 번호 넣기" disabled={!phone} />
          {!phone && <p className="text-sm text-muted">4단계에서 번호를 받으면 켤 수 있어요.</p>}
        </div>
        <div>
          <p className="text-sm text-muted">넣을 영상</p>
          <div className="mt-1 flex gap-4">
            {(["short", "long"] as const).map((k) => (
              <label key={k} className="flex min-h-11 cursor-pointer items-center gap-2">
                <input type="checkbox" className="size-4" checked={deco[k]} onChange={(e) => set({ [k]: e.target.checked })} />
                {k === "short" ? "숏폼 3개" : "롱폼(원본 영상)"}
              </label>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted">위 숏폼 카드와 옆 롱폼 미리보기에 바로 반영돼요.</p>
      </div>
      <div>
        <p className="mb-2 text-sm text-muted">롱폼 미리보기</p>
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black">
          {videoUrl ? (
            <video src={`${videoUrl}#t=1`} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white/70">영상을 준비하면 여기에 보여요</span>
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
  { id: "instagram", label: "인스타그램 릴스", handle: "@my_store" },
  { id: "youtube", label: "유튜브 쇼츠·롱폼", handle: "My Store" },
  { id: "tiktok", label: "틱톡", handle: "@my_store" },
] as const;
type ChannelId = (typeof CHANNELS)[number]["id"];
type ConnState = "off" | "connecting" | "on";

export function SnsStep({ highlights, siteUrl, onPosted }: { highlights: Highlight[]; siteUrl: string | null; onPosted: () => void }) {
  const [conn, setConn] = useState<Record<ChannelId, ConnState>>({ instagram: "off", youtube: "off", tiktok: "off" });
  const [picked, setPicked] = useState<boolean[]>([true, true, true, false]); // 숏폼 3개 + 롱폼
  const [link, setLink] = useState(true);
  const [posting, setPosting] = useState<number | null>(null); // 올린 개수
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const items = [...highlights.map((h, i) => `숏폼 ${i + 1} · ${h.hook}`), "롱폼(원본 영상) · 유튜브"];
  const connected = CHANNELS.filter((c) => conn[c.id] === "on");
  const jobs = items
    .map((label, i) => ({ label, i }))
    .filter(({ i }) => picked[i])
    .flatMap(({ label, i }) =>
      connected
        .filter((c) => (i === items.length - 1 ? c.id === "youtube" : true))
        .map((c) => `${c.label.split(" ")[0]} · ${label}`),
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

  if (highlights.length === 0) return <p className="text-muted">숏폼이 나오면 연결한 채널에 바로 올릴 수 있어요.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted">
          채널 연결 <MockBadge />
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
                <span className="block font-medium">{c.label}</span>
                <span className="block text-sm text-muted">
                  {conn[c.id] === "on" ? `✓ 연결됨 ${c.handle}` : conn[c.id] === "connecting" ? "연결 중…" : "눌러서 연결"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm text-muted">올릴 영상</p>
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
          <span>캡션에 제품 사이트 링크 넣기{siteUrl ? "" : " (5단계에서 주소를 넣으면 켤 수 있어요)"}</span>
        </label>
        <p className="text-xs text-muted">인스타그램 캡션 링크는 눌리지 않아 «프로필 링크 참고» 문구로 넣어요. 영상 속 QR·전화번호가 그래서 중요해요.</p>
      </div>
      <button type="button" disabled={jobs.length === 0 || (posting !== null && !done)} onClick={post} className={primary}>
        {connected.length === 0 ? "채널을 먼저 연결해 주세요" : `${jobs.length}건 올리기`}
      </button>
      {posting !== null && (
        <ul className="space-y-1.5 rounded-xl border border-line p-4 text-sm">
          {jobs.map((j, i) => (
            <li key={j} className={i < posting ? "" : i === posting ? "text-accent" : "text-muted"}>
              {i < posting ? "✓ 게시됨" : i === posting ? "◉ 올리는 중" : "○ 대기"} · {j}
            </li>
          ))}
          {done && (
            <li className="pt-2 text-muted">
              <MockBadge /> 실제 계정에는 올라가지 않았어요.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
