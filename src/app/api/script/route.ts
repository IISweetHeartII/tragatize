import { ask } from "@/lib/ai";
import { extractJson } from "@/lib/json";
import { allow, clientIp } from "@/lib/rate-limit";
import type { LiveScript } from "@/lib/types";

export const maxDuration = 120;


const SYSTEM = `당신은 소상공인 라이브 커머스 PD 입니다. 사장님이 카메라 한 대로 혼자 찍을 수 있는 라이브 방송 대본을 템플릿 형태로 씁니다.
반드시 JSON 하나만 출력하세요. 형식:
{"title":"방송 제목","target":"주 시청자(국가·연령)","sections":[{"name":"구간 이름","minutes":숫자,"say":"사장님이 그대로 읽을 대사(2~4문장)","show":"화면에 보여줄 것·카메라 동작"}],"tips":["짧은 팁"]}
구간은 5~6개: 오프닝 후킹 → 상품 소개 → 직접 시연/시식 → 가격·혜택 → 질문 답변 → 마무리 콜투액션.
하이라이트 숏폼으로 잘리기 좋게 각 구간에 15~30초짜리 «한 문장 후킹» 이 들어가게 쓰세요. 과장 광고·효능 단정은 쓰지 마세요.`;

export async function POST(req: Request): Promise<Response> {
  if (!allow(`script:${clientIp(req)}`, 10, 60_000)) {
    return Response.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as
    | { product?: string; store?: string; audience?: string }
    | null;
  const product = (body?.product ?? "").trim().slice(0, 500);
  if (!product) return Response.json({ error: "팔 상품을 적어 주세요." }, { status: 400 });
  const prompt = [
    `상품: ${product}`,
    `가게: ${(body?.store ?? "").trim().slice(0, 300) || "(미입력)"}`,
    `원하는 손님: ${(body?.audience ?? "").trim().slice(0, 300) || "(미입력)"}`,
  ].join("\n");
  try {
    let script: LiveScript;
    try {
      script = extractJson<LiveScript>(await ask(SYSTEM, prompt, 6000));
    } catch {
      // 모델 출력이 잘리거나 JSON 이 깨지면 한 번만 다시 시도한다.
      script = extractJson<LiveScript>(await ask(SYSTEM, `${prompt}\n\n반드시 올바른 JSON 하나만, 대사 안에 큰따옴표를 쓰지 마세요.`, 6000));
    }
    return Response.json({ script });
  } catch (err) {
    console.error("script failed", err);
    return Response.json({ error: "대본을 만들지 못했어요. 다시 시도해 주세요." }, { status: 502 });
  }
}
