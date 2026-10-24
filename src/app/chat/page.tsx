import type { Metadata } from "next";
import { ChatClient } from "./chat-client";

export const metadata: Metadata = { title: "채팅" };

export default function ChatPage() {
  return <ChatClient />;
}
