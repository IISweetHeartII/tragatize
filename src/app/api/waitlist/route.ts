import { list, put } from "@vercel/blob";
import { allow, clientIp } from "@/lib/rate-limit";

// 파일럿 신청(이메일) 저장. DB 대신 Vercel Blob 에 한 건당 JSON 하나.
// 공개 저장소라 경로에 임의 꼬리를 붙여 주소를 추측할 수 없게 하고, 주소는 응답에 돌려주지 않는다(목록은 서버 토큰으로만).
const PREFIX = "waitlist/";
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export async function POST(req: Request): Promise<Response> {
  if (!allow(`waitlist:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return Response.json({ error: "잠시 뒤 다시 시도해 주세요." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { email?: unknown; shop?: unknown; locale?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email)) return Response.json({ error: "이메일 주소를 확인해 주세요." }, { status: 400 });
  const shop = typeof body.shop === "string" ? body.shop.trim().slice(0, 100) : "";
  const locale = typeof body.locale === "string" ? body.locale.slice(0, 8) : "ko";
  await put(`${PREFIX}${Date.now()}.json`, JSON.stringify({ email, shop, locale, at: new Date().toISOString() }), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });
  return Response.json({ ok: true, count: await count() });
}

export async function GET(): Promise<Response> {
  return Response.json({ count: await count() });
}

async function count(): Promise<number> {
  let n = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    n += page.blobs.length;
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return n;
}
