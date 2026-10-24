import type { Metadata } from "next";
import QRCode from "qrcode";
import { ORDER_PHONE, SITE_URL } from "@/lib/site";

// 명함 대신 보여 주는 팀 페이지. 폰에 띄운 QR 을 상대가 찍으면 이 페이지가 열린다.
// 공개 페이지라 전화번호·이메일은 넣지 않는다(README 와 같은 범위).
export const metadata: Metadata = {
  title: "팀 트라가티제",
  alternates: { canonical: "/team" },
};

const MEMBERS = [
  { name: "김해청", role: "팀장 · 발표", link: null },
  { name: "김덕환", role: "AI 엔지니어 · 전화 AI 운영", link: { label: "GitHub", href: "https://github.com/IISweetHeartII" } },
  { name: "김성재", role: "백엔드 개발", link: { label: "GitHub", href: "https://github.com/AgwaB" } },
  { name: "윤정민", role: "이커머스 세일즈", link: { label: "LinkedIn", href: "https://www.linkedin.com/in/jeongmin-yoon-09953541" } },
];

export default async function TeamPage() {
  const url = `${SITE_URL}/team`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-semibold text-muted">Ambition for Korea 2026 · Wildcard</p>
        <h1 className="mt-1 text-3xl font-bold">Team Tragatize</h1>
        <p className="mt-2 text-muted">One product video, sales worldwide.</p>
      </header>

      <div className="mx-auto w-56 rounded-2xl bg-white p-3 ring-1 ring-line" aria-label="이 페이지 QR" dangerouslySetInnerHTML={{ __html: qr }} />

      <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        {MEMBERS.map((m) => (
          <li key={m.name} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-muted">{m.role}</p>
            </div>
            {m.link && (
              <a href={m.link.href} target="_blank" rel="noreferrer" className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-line hover:bg-background">
                {m.link.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="grid gap-3">
        <a href="/studio?demo=1" className="flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 font-semibold text-white">
          데모 바로 보기
        </a>
        <a href="/pilot" className="flex min-h-12 items-center justify-center rounded-full px-6 font-semibold ring-1 ring-line">
          파일럿 신청
        </a>
        <p className="text-center text-sm text-muted">AI 상담원 티제 · {ORDER_PHONE}</p>
      </div>
    </main>
  );
}
