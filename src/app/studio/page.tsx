import type { Metadata } from "next";
import { StudioClient } from "./studio-client";

export const metadata: Metadata = {
  title: "스튜디오",
  description: "라이브 대본을 받고, 찍은 영상을 올리면 AI 가 숏폼 하이라이트를 골라 줍니다.",
};

export default function StudioPage() {
  return <StudioClient />;
}
