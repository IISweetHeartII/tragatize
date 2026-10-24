import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { activeCaller, sendSms } from "@/lib/clawops";
import { PRODUCTS, findProduct, won } from "@/lib/products";

// ClawOps 전화 에이전트(AI 티제)가 통화 중에 부르는 도구. Bearer MCP_AUTH_TOKEN 으로만 연다.
const PHONE = /^01[016789]\d{7,8}$/;

// 주문 확인 문자 — 손님과 통화한 언어로(미국·한국·일본·중국·대만·베트남·태국). "zh" 는 예전 지시문 호환용(간체).
const SMS_LANGS = ["ko", "en", "ja", "zh", "zh-CN", "zh-TW", "vi", "th"] as const;
type SmsLang = (typeof SMS_LANGS)[number];

function orderSms(lang: SmsLang, p: { name: string; nameEn: string; price: number }): string {
  const krw = p.price.toLocaleString("en-US");
  switch (lang) {
    case "ko":
      return `[트라가티제] ${p.name} ${won(p.price)} 주문 확인 문자예요. 받으실 주소를 이 문자에 답장으로 보내 주세요. 감사합니다!`;
    case "ja":
      return `[Tragatize] ご注文確認：${p.nameEn}（₩${krw}）。お届け先の住所をこのメッセージに返信してください。ありがとうございます！`;
    case "zh":
    case "zh-CN":
      return `[Tragatize] 订单确认：${p.nameEn}（₩${krw}）。请直接回复本短信告知收货地址。谢谢！`;
    case "zh-TW":
      return `[Tragatize] 訂單確認：${p.nameEn}（₩${krw}）。請直接回覆本簡訊告知收件地址。謝謝！`;
    case "vi":
      return `[Tragatize] Xác nhận đơn hàng: ${p.nameEn} (₩${krw}). Vui lòng trả lời tin nhắn này kèm địa chỉ nhận hàng. Cảm ơn bạn!`;
    case "th":
      return `[Tragatize] ยืนยันคำสั่งซื้อ: ${p.nameEn} (₩${krw}) กรุณาตอบกลับข้อความนี้พร้อมที่อยู่สำหรับจัดส่ง ขอบคุณ!`;
    default:
      return `[Tragatize] Order: ${p.nameEn} (KRW ${krw}). Please reply to this message with your delivery address. Thank you!`;
  }
}

const handler = createMcpHandler((server) => {
  server.registerTool(
    "list_products",
    {
      title: "상품 목록",
      description: "판매 중인 상품 목록(이름·가격·한 줄 소개·추천 여부)을 돌려준다. 손님이 상품을 말하면 먼저 이걸로 확인한다.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            PRODUCTS.map((p) => ({ id: p.id, name: p.name, nameEn: p.nameEn, price: won(p.price), pitch: p.pitch, featured: !!p.featured })),
          ),
        },
      ],
    }),
  );

  server.registerTool(
    "send_order_sms",
    {
      title: "주문 확인 문자 보내기",
      description:
        "손님이 상품을 확정하면 부른다. phone 을 비우면 지금 전화를 건 번호로 자동 발송한다(손님에게 번호를 묻지 않는다). 결과에 받는 번호 뒷자리 4개가 온다.",
      inputSchema: z.object({
        product: z.string().describe("상품 id 또는 이름"),
        language: z.enum(SMS_LANGS).default("ko").describe("손님과 통화한 언어(ko·en·ja·zh-CN·zh-TW·vi·th)"),
        phone: z.string().optional().describe("손님이 다른 번호로 받겠다고 할 때만 그 번호(숫자만)"),
      }),
    },
    async ({ product, language, phone }) => {
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
          content: [{ type: "text", text: "지금 거신 번호를 확인하지 못했어요. 손님에게 문자 받을 휴대폰 번호를 물어 phone 에 넣어 다시 부르세요." }],
          isError: true,
        };
      }
      const p = findProduct(product);
      if (!p) {
        return { content: [{ type: "text", text: `없는 상품이에요. 가능한 상품: ${PRODUCTS.map((x) => x.name).join(", ")}` }], isError: true };
      }
      const body = orderSms(language, p);
      try {
        await sendSms(to, body, `order-${to}-${p.id}-${new Date().toISOString().slice(0, 13)}`);
        return {
          content: [
            { type: "text", text: `문자를 보냈어요(${p.name}, 받는 번호 끝자리 ${to.slice(-4)}). 손님에게 «끝자리 ${to.slice(-4)} 번호로 보냈다» 고 말하고 주소를 문자로 답장해 달라고 안내하세요.` },
          ],
        };
      } catch (err) {
        console.error("sms failed", err);
        return { content: [{ type: "text", text: "문자 발송에 실패했어요. 손님에게 사과하고 잠시 뒤 다시 시도한다고 안내하세요." }], isError: true };
      }
    },
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
