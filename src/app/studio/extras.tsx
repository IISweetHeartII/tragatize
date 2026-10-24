"use client";

// 스튜디오의 «시연용» 단계들: AI 홍보 영상(Premium), 전화 응대, 영상 꾸미기, SNS 올리기.
// 실제 생성·발급·게시는 하지 않는다. 화면마다 «시연용» 배지를 붙여 미리 만든 결과임을 밝힌다.
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export type Deco = { qr: boolean; url: string; phone: boolean; long: boolean; short: boolean };
export const NO_DECO: Deco = { qr: false, url: "", phone: false, long: true, short: true };

export function MockBadge({ children = "시연용" }: { children?: React.ReactNode }) {
  return <span className="inline-block rounded-full border border-line px-2 py-0.5 text-xs font-normal text-muted">{children}</span>;
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

export function decoFor(target: "short" | "long", deco: Deco, phone: string | null): { phone: string | null; qrUrl: string | null } {
  if (!deco[target]) return { phone: null, qrUrl: null };
  return {
    phone: deco.phone && phone ? phone : null,
    qrUrl: deco.qr && /^https?:\/\/\S+\.\S+/.test(deco.url) ? deco.url : null,
  };
}
