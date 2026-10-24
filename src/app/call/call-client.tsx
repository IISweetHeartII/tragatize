"use client";

import { useEffect, useState } from "react";

type CallState = { callId: string; status: string; duration?: number | null; hangupCause?: string | null };

const DONE = new Set(["completed", "no-answer", "busy", "failed", "canceled"]);
const LABEL: Record<string, string> = {
  queued: "거는 중",
  ringing: "벨 울리는 중",
  "in-progress": "통화 중",
  completed: "통화 끝",
  "no-answer": "받지 않음",
  busy: "통화 중이라 연결 안 됨",
  failed: "실패",
  canceled: "취소됨",
};

export function CallClient() {
  const [to, setTo] = useState("");
  const [purpose, setPurpose] = useState("");
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [call, setCall] = useState<CallState | null>(null);

  useEffect(() => {
    if (!call || DONE.has(call.status)) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/call?id=${encodeURIComponent(call.callId)}`);
      if (res.ok) setCall((await res.json()) as CallState);
    }, 2000);
    return () => clearInterval(timer);
  }, [call]);

  async function start(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCall(null);
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, purpose, passcode }),
      });
      const data = (await res.json()) as CallState & { error?: string };
      if (!res.ok || !data.callId) throw new Error(data.error ?? "전화를 걸지 못했어요.");
      setCall(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold">AI 가 전화를 걸어요</h1>
      <p className="mt-2 text-muted">번호를 넣으면 070-5276-7530 에서 AI 가 전화합니다.</p>

      <form onSubmit={start} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm text-muted">받을 번호</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            inputMode="tel"
            placeholder="01012345678"
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">통화 목적 (비우면 연결 시험 통화)</span>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
            maxLength={1500}
            placeholder="예: 내일 오후 3시에 2명 예약이 되는지 물어봐 줘"
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">비밀번호</span>
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground"
          />
        </label>
        <button
          disabled={busy || !to || !passcode}
          className="w-full rounded-xl bg-foreground py-3 font-medium text-background disabled:opacity-40"
        >
          {busy ? "거는 중…" : "전화 걸기"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}
      {call && (
        <div className="mt-6 rounded-xl border border-line p-4">
          <p className="font-medium">{LABEL[call.status] ?? call.status}</p>
          <p className="mt-1 font-mono text-xs text-muted">
            {call.callId}
            {call.duration ? ` · ${call.duration}초` : ""}
            {call.hangupCause ? ` · ${call.hangupCause}` : ""}
          </p>
        </div>
      )}
    </main>
  );
}
