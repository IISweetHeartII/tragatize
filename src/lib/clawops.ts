import "server-only";

// ClawOps(070 전화 AI) 서버 클라이언트. 키는 Vercel 환경변수·.env.local 에만 둔다.
// ClawOps API 는 국외 IP 를 막는다 → 이 모듈을 쓰는 함수는 서울(icn1)에서 돌아야 한다(vercel.json).
const BASE = "https://api.claw-ops.com/v1/accounts";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${env("CLAWOPS_ACCOUNT_ID")}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env("CLAWOPS_API_KEY")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { code?: string; error?: string };
  if (!res.ok) throw new Error(`clawops ${method} ${path} ${res.status} ${data.code ?? ""} ${data.error ?? ""}`);
  return data;
}

export type Agent = { agentId: string; name: string; phoneNumbers: string[]; model: string | null };

export async function getAgent(): Promise<Agent> {
  return call<Agent>("GET", `/agents/${env("CLAWOPS_AGENT_ID")}`);
}

export type CallStatus = {
  callId: string;
  status: string; // queued | ringing | in-progress | completed | no-answer | busy | failed | canceled
  duration: number | null;
  hangupCause: string | null;
};

export async function getCall(callId: string): Promise<CallStatus> {
  const d = await call<CallStatus>("GET", `/calls/${encodeURIComponent(callId)}`);
  return { callId: d.callId, status: d.status, duration: d.duration ?? null, hangupCause: d.hangupCause ?? null };
}

// 지금 우리 번호로 걸려 와 통화 중인 전화의 발신 번호(가장 최근 1건). 없으면 null.
export async function activeCaller(): Promise<string | null> {
  const q = new URLSearchParams({ to: env("CLAWOPS_NUMBER"), status: "in-progress", pageSize: "1" });
  const d = await call<{ data?: { from?: string; direction?: string }[] }>("GET", `/calls?${q}`);
  const c = d.data?.find((x) => x.direction === "inbound");
  return c?.from ?? null;
}

// 같은 070 번호로 문자를 보낸다. 본문이 한글 45자를 넘으면 ClawOps 가 LMS 로 자동 전환한다.
export async function sendSms(to: string, body: string, idempotencyKey?: string): Promise<{ messageId?: string; status?: string }> {
  return call("POST", "/messages", {
    To: to.replace(/[^\d+]/g, ""),
    From: env("CLAWOPS_NUMBER"),
    Body: body,
    ...(idempotencyKey ? { IdempotencyKey: idempotencyKey } : {}),
  });
}

export type DialInput = {
  to: string; // 받는 번호, 숫자만 (예: 01012345678)
  instruction: string; // 이번 통화에만 붙는 지시문, 4000자 이하
  timeoutSec?: number;
};

export async function dial({ to, instruction, timeoutSec = 30 }: DialInput): Promise<CallStatus> {
  if (instruction.length > 4000) throw new Error("instruction exceeds 4000 chars");
  return call("POST", "/calls", {
    To: to.replace(/\D/g, ""),
    From: env("CLAWOPS_NUMBER"),
    AgentId: env("CLAWOPS_AGENT_ID"),
    CallContext: { Instruction: instruction },
    Timeout: timeoutSec,
  });
}
