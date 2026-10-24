"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "응답이 없어요.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6">
      <div className="flex-1 space-y-3 pb-4">
        {messages.length === 0 && (
          <p className="pt-16 text-center text-muted">무엇이든 물어보세요. Claude 가 답합니다.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <p
              className={
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 leading-relaxed " +
                (m.role === "user" ? "bg-foreground text-background" : "border border-line")
              }
            >
              {m.content}
            </p>
          </div>
        ))}
        {busy && <p className="text-sm text-muted">답변을 쓰는 중…</p>}
        {error && <p className="text-sm text-accent">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="sticky bottom-0 flex gap-2 bg-background py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력"
          maxLength={2000}
          className="flex-1 rounded-xl border border-line bg-background px-4 py-3 outline-none focus:border-foreground"
        />
        <button
          disabled={busy || !input.trim()}
          className="rounded-xl bg-foreground px-5 font-medium text-background disabled:opacity-40"
        >
          보내기
        </button>
      </form>
    </main>
  );
}
