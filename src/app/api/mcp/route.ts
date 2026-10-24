import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { sendSms } from "@/lib/clawops";
import { PRODUCTS, findProduct, won } from "@/lib/products";

// ClawOps 전화 에이전트(AI 티제)가 통화 중에 부르는 도구. Bearer MCP_AUTH_TOKEN 으로만 연다.
const PHONE = /^01[016789]\d{7,8}$/;

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
        "손님이 상품과 전화번호를 확인해 준 뒤에만 부른다. 그 번호로 주문 확인 문자를 보내고, 배송 주소를 문자 답장으로 받도록 안내한다.",
      inputSchema: z.object({
        phone: z.string().describe("손님 휴대폰 번호, 숫자만 (예: 01012345678). 손님에게 되읽어 확인받은 값"),
        product: z.string().describe("상품 id 또는 이름"),
        language: z.enum(["ko", "en", "ja", "zh"]).default("ko").describe("손님과 통화한 언어"),
      }),
    },
    async ({ phone, product, language }) => {
      const to = phone.replace(/\D/g, "");
      if (!PHONE.test(to)) {
        return { content: [{ type: "text", text: "전화번호 형식이 맞지 않아요. 손님에게 다시 확인하세요." }], isError: true };
      }
      const p = findProduct(product);
      if (!p) {
        return { content: [{ type: "text", text: `없는 상품이에요. 가능한 상품: ${PRODUCTS.map((x) => x.name).join(", ")}` }], isError: true };
      }
      const body =
        language === "ko"
          ? `[트라가티제] ${p.name} ${won(p.price)} 주문 확인 문자예요. 받으실 주소를 이 문자에 답장으로 보내 주세요. 감사합니다!`
          : `[Tragatize] Order: ${p.nameEn} (KRW ${p.price.toLocaleString("en-US")}). Please reply to this message with your delivery address. Thank you!`;
      try {
        await sendSms(to, body, `order-${to}-${p.id}-${new Date().toISOString().slice(0, 13)}`);
        return { content: [{ type: "text", text: `문자를 보냈어요(${p.name}). 손님에게 문자로 주소를 답장해 달라고 안내하세요.` }] };
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
  // 발신자 정보가 헤더로 오는지 확인하려고 헤더 이름만 남긴다(값은 남기지 않음).
  console.log("mcp headers", [...req.headers.keys()].join(","));
  return handler(req);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
