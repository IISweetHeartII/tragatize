import type { Metadata } from "next";
import QRCode from "qrcode";
import { KDH, kdhPhone, prettyPhone } from "@/lib/kdh";
import { SITE_URL } from "@/lib/site";

// 김덕환 디지털 명함. QR 을 찍으면 이 페이지가 열리고, 연락처 저장·문자 보내기를 한 번에 한다.
export const metadata: Metadata = {
  title: "김덕환 · Team Tragatize",
  robots: { index: false, follow: false },
};

export default async function KdhCard() {
  const phone = kdhPhone();
  const qr = await QRCode.toString(`${SITE_URL}/team/kdh`, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  const smsBody = encodeURIComponent("안녕하세요, 덕환님! 오늘 데모데이에서 만난 (이름 / 회사)입니다.");
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-10 text-center sm:px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={KDH.photo} alt={KDH.name} width={112} height={112} className="size-28 rounded-full object-cover ring-1 ring-line" />
      <div>
        <h1 className="text-3xl font-bold">{KDH.name}</h1>
        <p className="mt-1 text-muted">
          {KDH.title} · {KDH.org}
        </p>
        <p className="mt-1 text-sm text-muted">Team Tragatize · Ambition for Korea 2026</p>
        {phone && <p className="mt-3 text-lg font-semibold tabular-nums select-all">{prettyPhone(phone)}</p>}
      </div>

      <div className="grid w-full gap-3">
        <a href="/team/kdh/vcard" className="flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 font-semibold text-white">
          연락처 저장
        </a>
        {phone && (
          <a href={`sms:${phone}?&body=${smsBody}`} className="flex min-h-12 items-center justify-center rounded-full px-6 font-semibold ring-1 ring-line">
            문자로 내 연락처 보내기
          </a>
        )}
        <div className="flex gap-3">
          <a href={KDH.github} target="_blank" rel="noreferrer" className="flex min-h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-line">
            GitHub
          </a>
          <a href={KDH.site} target="_blank" rel="noreferrer" className="flex min-h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-line">
            log8.kr
          </a>
          <a href="/studio?demo=1" className="flex min-h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-line">
            데모
          </a>
        </div>
      </div>

      <div className="mt-2 w-48 rounded-2xl bg-white p-3 ring-1 ring-line" aria-label="이 명함 QR" dangerouslySetInnerHTML={{ __html: qr }} />
    </main>
  );
}
