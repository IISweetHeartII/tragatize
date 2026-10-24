"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

// 파일럿 신청 폼. 한국어 화면은 한국어, 나머지 언어 화면은 영어로 보여 준다(사전 7개를 건드리지 않게 여기서만).
const TEXT = {
  ko: {
    title: "파일럿 매장 신청",
    body: "성수·명동부터 10곳과 먼저 시작해요. 이메일을 남기면 연락드릴게요.",
    email: "이메일",
    shop: "매장·브랜드 이름 (선택)",
    submit: "신청하기",
    sending: "보내는 중…",
    done: "신청됐어요! 곧 연락드릴게요.",
    count: (n: number) => `지금까지 ${n}곳이 신청했어요`,
  },
  en: {
    title: "Join the pilot",
    body: "We start with 10 shops in Seoul. Leave your email and we'll reach out.",
    email: "Email",
    shop: "Shop or brand name (optional)",
    submit: "Sign up",
    sending: "Sending…",
    done: "You're in! We'll be in touch soon.",
    count: (n: number) => `${n} shops signed up so far`,
  },
};

export function WaitlistForm({ locale }: { locale: Locale }) {
  const t = locale === "ko" ? TEXT.ko : TEXT.en;
  const [email, setEmail] = useState("");
  const [shop, setShop] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d: { count?: number }) => setCount(typeof d.count === "number" ? d.count : null))
      .catch(() => {});
  }, []);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, shop, locale }),
      });
      const d = (await r.json()) as { count?: number; error?: string };
      if (!r.ok) throw new Error(d.error ?? "error");
      setCount(d.count ?? null);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
      setState("idle");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-[24px] bg-white p-6 text-left text-[#120f0c] ring-1 ring-line">
      <h3 className="text-xl font-bold">{t.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.body}</p>
      {state === "done" ? (
        <p className="mt-5 rounded-2xl bg-background px-4 py-4 font-semibold">{t.done}</p>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            aria-label={t.email}
            className="min-h-12 rounded-2xl border border-line px-4 text-base"
          />
          <input
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            placeholder={t.shop}
            aria-label={t.shop}
            maxLength={100}
            className="min-h-12 rounded-2xl border border-line px-4 text-base"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="min-h-12 rounded-full bg-[#120f0c] px-7 font-semibold text-white hover:bg-[#120f0c]/90 disabled:opacity-60"
          >
            {state === "sending" ? t.sending : t.submit}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
      {count !== null && count > 0 && <p className="mt-4 text-sm text-muted">{t.count(count)}</p>}
    </div>
  );
}
