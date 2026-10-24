"use client";

import { useState } from "react";
import { DEMO_VIDEOS } from "@/lib/site";

type Plan = keyof typeof DEMO_VIDEOS;

// 랜딩 데모: Lite·Premium 사용 화면 녹화를 탭으로 바꿔 본다.
// 녹화본은 양옆 빈 여백을 잘라 5:4 로 만들었다(본문이 더 크게 보이게). 영상 바탕색(#faf8f4)이 페이지와 거의 같아서 틀 없이 옅은 테두리·그림자만 준다.
export function DemoVideos({ label, tabs }: { label: string; tabs: Record<Plan, string> }) {
  const [plan, setPlan] = useState<Plan>("lite");
  const v = DEMO_VIDEOS[plan];
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="font-mono text-xs text-accent">{label}</p>
        <div className="flex gap-2" role="tablist">
          {(Object.keys(DEMO_VIDEOS) as Plan[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={plan === k}
              onClick={() => setPlan(k)}
              className={
                "min-h-11 rounded-full border px-4 text-sm " +
                (plan === k ? "border-foreground bg-foreground text-background" : "border-line hover:border-foreground")
              }
            >
              {tabs[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[#faf8f4] shadow-[0_1px_2px_rgba(22,19,15,0.06),0_16px_40px_-16px_rgba(22,19,15,0.22)] ring-1 ring-line">
        <video key={plan} src={v.src} poster={v.poster} controls muted playsInline preload="none" className="block aspect-[5/4] w-full" />
      </div>
    </>
  );
}
