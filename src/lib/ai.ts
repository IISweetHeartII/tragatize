import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// 서버에서만 쓴다. 키는 Vercel 환경변수·.env.local 의 ANTHROPIC_API_KEY.
export const MODEL: string = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

export const anthropic = new Anthropic();

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function chat(system: string, messages: ChatMessage[], maxTokens = 1024): Promise<string> {
  const message = await anthropic.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages });
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function ask(system: string, prompt: string, maxTokens = 1024): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
