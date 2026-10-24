"use client";

import { useEffect, useRef } from "react";

// 화면에 보일 때만 소리 없이 자동 재생하고, start~end 구간을 반복한다(구간이 없으면 영상 전체 반복).
export function LoopVideo({
  src,
  start = 0,
  end,
  poster,
  className,
}: {
  src: string;
  start?: number;
  end?: number;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const toStart = () => {
      if (start > 0) v.currentTime = start;
    };
    const onTime = () => {
      if (end !== undefined && v.currentTime >= end) v.currentTime = start;
    };
    const onEnded = () => {
      v.currentTime = start;
      void v.play().catch(() => {});
    };
    v.addEventListener("loadedmetadata", toStart);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("loadedmetadata", toStart);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
    };
  }, [start, end]);

  return <video ref={ref} src={src} poster={poster} muted playsInline preload="metadata" className={className} />;
}
