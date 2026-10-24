import { chat, type ChatMessage } from "@/lib/ai";
import { allow, clientIp } from "@/lib/rate-limit";

const SYSTEM =
  "당신은 팀 트라가티제(Tragatize)의 AI 입니다. 짧고 친절한 한국어 존댓말로 답하세요. 상대가 다른 언어로 말하면 그 언어로 답하세요.";
const MAX_TURNS = 20;
const MAX_CHARS = 2000;

export async function POST(req: Request): Promise<Response> {
  if (!allow(`chat:${clientIp(req)}`, 20, 60_000)) {
    return Response.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { messages?: ChatMessage[] } | null;
  const messages = (body?.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "메시지를 입력해 주세요." }, { status: 400 });
  }
  try {
    const reply = await chat(SYSTEM, messages, 1024);
    return Response.json({ reply });
  } catch (err) {
    console.error("chat failed", err);
    return Response.json({ error: "AI 응답에 실패했어요. 다시 시도해 주세요." }, { status: 502 });
  }
}
