import type { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist-form";

// 발표 슬라이드 QR 이 가리키는 짧은 주소. 폼 하나만 둔다.
export const metadata: Metadata = {
  title: "파일럿 신청",
  alternates: { canonical: "/pilot" },
};

export default function PilotPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16 sm:px-6">
      <WaitlistForm locale="ko" />
    </main>
  );
}
