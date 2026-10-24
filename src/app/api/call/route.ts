import { dial, getCall } from "@/lib/clawops";
import { allow, clientIp } from "@/lib/rate-limit";

// 공개 주소라 비밀번호(CALL_PASSCODE) 없이는 발신하지 않는다 — 우리 번호로 아무에게나 거는 걸 막는다.
const PHONE = /^0\d{8,10}$/;

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as
    | { to?: string; purpose?: string; passcode?: string }
    | null;
  const passcode = process.env.CALL_PASSCODE;
  if (!passcode || body?.passcode !== passcode) {
    return Response.json({ error: "비밀번호가 맞지 않아요." }, { status: 401 });
  }
  if (!allow(`call:${clientIp(req)}`, 5, 10 * 60_000)) {
    return Response.json({ error: "10분에 5통까지만 걸 수 있어요." }, { status: 429 });
  }
  const to = (body.to ?? "").replace(/\D/g, "");
  if (!PHONE.test(to)) {
    return Response.json({ error: "전화번호를 숫자로 정확히 입력해 주세요. 예: 01012345678" }, { status: 400 });
  }
  const purpose = (body.purpose ?? "").trim().slice(0, 1500);
  const instruction = purpose
    ? `[이번 통화 목적]\n${purpose}`
    : "[이번 통화 목적]\n연결 시험 통화입니다. 인사하고, 잘 들리는지 묻고, 짧게 대화한 뒤 끝내세요.";
  try {
    const call = await dial({ to, instruction });
    return Response.json({ callId: call.callId, status: call.status });
  } catch (err) {
    console.error("dial failed", err);
    return Response.json({ error: "전화 걸기에 실패했어요." }, { status: 502 });
  }
}

export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id 가 필요해요." }, { status: 400 });
  try {
    return Response.json(await getCall(id));
  } catch (err) {
    console.error("get call failed", err);
    return Response.json({ error: "통화 상태를 못 읽었어요." }, { status: 502 });
  }
}
