"use client";

// 스튜디오의 «시연용» 단계들: AI 홍보 영상(Premium), 전화 응대, 영상 꾸미기, SNS 올리기.
// 실제 생성·발급·게시는 하지 않는다. 화면마다 «시연용» 배지를 붙여 미리 만든 결과임을 밝힌다.
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import type { QA } from "@/lib/demo";
import { ORDER_PHONE } from "@/lib/site";

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
