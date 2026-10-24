import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { activeCaller, sendSms } from "@/lib/clawops";
import { PRODUCTS, findProduct, won, type Product } from "@/lib/products";

// ClawOps 전화 에이전트(AI 티제)가 통화 중에 부르는 도구. Bearer MCP_AUTH_TOKEN 으로만 연다.
const PHONE = /^01[016789]\d{7,8}$/;

// 살 곳 안내 문자 — 손님과 통화한 언어로(미국·한국·일본·중국·대만·베트남·태국). "zh" 는 예전 지시문 호환용(간체).
// 주문·결제·주소는 받지 않는다. 상품 이름·가격과 살 수 있는 곳(where)만 보낸다.
const SMS_LANGS = ["ko", "en", "ja", "zh", "zh-CN", "zh-TW", "vi", "th"] as const;
type SmsLang = (typeof SMS_LANGS)[number];

function infoSms(lang: SmsLang, p: Product): string {
  const krw = p.price.toLocaleString("en-US");
  switch (lang) {
    case "ko":
      return `[트라가티제] ${p.name} ${won(p.price)} — ${p.where.ko} 문의해 주셔서 감사합니다!`;
    case "ja":
      return `[Tragatize] ${p.nameEn}（₩${krw}）— ${p.where.ja} お問い合わせありがとうございます！`;
    case "zh":
    case "zh-CN":
      return `[Tragatize] ${p.nameEn}（₩${krw}）— ${p.where["zh-CN"]} 感谢您的来电咨询！`;
    case "zh-TW":
      return `[Tragatize] ${p.nameEn}（₩${krw}）— ${p.where["zh-TW"]} 感謝您的來電詢問！`;
    case "vi":
      return `[Tragatize] ${p.nameEn} (₩${krw}) — ${p.where.vi} Cảm ơn bạn đã gọi hỏi!`;
    case "th":
      return `[Tragatize] ${p.nameEn} (₩${krw}) — ${p.where.th} ขอบคุณที่โทรมาสอบถาม!`;
    default:
      return `[Tragatize] ${p.nameEn} (₩${krw}) — ${p.where.en} Thanks for calling!`;
  }
}

const smsInput = z.object({
  product: z.string().describe("상품 id 또는 이름"),
  language: z.enum(SMS_LANGS).default("ko").describe("손님과 통화한 언어(ko·en·ja·zh-CN·zh-TW·vi·th)"),
  phone: z.string().optional().describe("손님이 다른 번호로 받겠다고 할 때만 그 번호(숫자만)"),
});

async function sendInfo({ product, language, phone }: z.infer<typeof smsInput>) {
  let to = (phone ?? "").replace(/\D/g, "");
  if (!to) {
    try {
      to = ((await activeCaller()) ?? "").replace(/\D/g, "");
    } catch (err) {
      console.error("caller lookup failed", err);
    }
  }
  if (!PHONE.test(to)) {
    return {
      content: [{ type: "text" as const, text: "지금 거신 번호를 확인하지 못했어요. 손님에게 문자 받을 휴대폰 번호를 물어 phone 에 넣어 다시 부르세요." }],
      isError: true,
    };
  }
  const p = findProduct(product);
  if (!p) {
    return { content: [{ type: "text" as const, text: `없는 상품이에요. 가능한 상품: ${PRODUCTS.map((x) => x.name).join(", ")}` }], isError: true };
  }
  try {
    await sendSms(to, infoSms(language, p), `info-${to}-${p.id}-${new Date().toISOString().slice(0, 13)}`);
    return {
      content: [
        { type: "text" as const, text: `문자를 보냈어요(${p.name}, 받는 번호 끝자리 ${to.slice(-4)}). 손님에게 «끝자리 ${to.slice(-4)} 번호로 살 수 있는 곳을 문자로 보내 드렸다» 고 말하세요. 주문·주소는 받지 않아요.` },
      ],
    };
  } catch (err) {
    console.error("sms failed", err);
    return { content: [{ type: "text" as const, text: "문자 발송에 실패했어요. 손님에게 사과하고 살 수 있는 곳을 말로 다시 알려 주세요." }], isError: true };
  }
}

const handler = createMcpHandler((server) => {
  server.registerTool(
    "list_products",
    {
      title: "상품 목록",
      description: "상품 목록(이름·가격·한 줄 소개·추천 여부·살 수 있는 곳)을 돌려준다. 손님이 상품을 말하면 먼저 이걸로 확인한다.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            PRODUCTS.map((p) => ({ id: p.id, name: p.name, nameEn: p.nameEn, price: won(p.price), pitch: p.pitch, featured: !!p.featured, where: p.where.ko, whereEn: p.where.en })),
          ),
        },
      ],
    }),
  );

  server.registerTool(
    "send_info_sms",
    {
      title: "살 곳 안내 문자 보내기",
      description:
        "손님이 사고 싶다고 하거나 어디서 사는지·위치를 물으면, 동의를 받고 부른다. 상품 이름·가격과 살 수 있는 곳(구매 링크·매장 위치)을 문자로 보낸다. 주문·결제·주소는 받지 않는다. phone 을 비우면 지금 전화를 건 번호로 보낸다(번호를 묻지 않는다). 결과에 받는 번호 끝자리 4개가 온다.",
      inputSchema: smsInput,
    },
    sendInfo,
  );

  // 예전 이름(ClawOps 에이전트 설정을 바꾸는 동안만 유지). 동작은 send_info_sms 와 같다.
  server.registerTool(
    "send_order_sms",
    {
      title: "살 곳 안내 문자 보내기(예전 이름)",
      description: "send_info_sms 와 같다. 새 통화에서는 send_info_sms 를 쓴다.",
      inputSchema: smsInput,
    },
    sendInfo,
  );
});

async function guarded(req: Request): Promise<Response> {
  const token = process.env.MCP_AUTH_TOKEN;
  if (!token || req.headers.get("authorization") !== `Bearer ${token}`) {
    return new Response("unauthorized", { status: 401 });
  }
  return handler(req);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
