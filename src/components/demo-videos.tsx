"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_VIDEOS } from "@/lib/site";

type Plan = keyof typeof DEMO_VIDEOS;

// 랜딩 데모: 직접 촬영·AI 홍보 영상 두 흐름의 사용 화면 녹화를 탭으로 바꿔 본다.
// 녹화본(5:4)을 브라우저 창 틀에 넣고, 화면에 보이면 소리 없이 자동 재생한다(컨트롤로 멈춤·되감기 가능).
export function DemoVideos({ label, tabs }: { label: string; tabs: Record<Plan, string> }) {
  const [plan, setPlan] = useState<Plan>("lite");
  const ref = useRef<HTMLVideoElement>(null);
  const v = DEMO_VIDEOS[plan];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [plan]);

  return (
    <div className="rounded-[28px] bg-[#16130f] p-2 shadow-[0_40px_80px_-40px_rgba(22,19,15,0.55)] sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1 pb-3 sm:px-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </span>
          <span className="hidden rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white/70 sm:inline">tragatize.log8.kr/studio</span>
        </div>
        <div className="flex rounded-full bg-white/10 p-1" role="tablist" aria-label={label}>
          {(Object.keys(DEMO_VIDEOS) as Plan[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={plan === k}
              onClick={() => setPlan(k)}
              className={
                "min-h-11 rounded-full px-4 text-sm font-medium transition-colors " +
                (plan === k ? "bg-white text-[#16130f]" : "text-white/70 hover:text-white")
              }
            >
              {tabs[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-[20px] bg-[#f3f2ef]">
        <video
          ref={ref}
          key={plan}
          src={v.src}
          poster={v.poster}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          className="block aspect-[5/4] w-full"
        />
      </div>
      <p className="px-3 pt-3 pb-1 text-xs text-white/50">{label}</p>
    </div>
  );
}
