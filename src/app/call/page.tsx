import type { Metadata } from "next";
import { CallClient } from "./call-client";

export const metadata: Metadata = { title: "전화" };

export default function CallPage() {
  return <CallClient />;
}
