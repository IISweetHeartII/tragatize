import type { Locale } from "@/lib/i18n";

// 전화 문의(AI 티제)·데모에서 쓰는 상품 목록. 실제 판매 상품이 정해지면 여기만 바꾼다.
// 주문·결제는 받지 않는다 — 티제는 where(살 수 있는 곳)를 말해 주고 문자로 보내 준다.
export type Product = {
  id: string;
  name: string;
  nameEn: string;
  price: number; // 원
  pitch: string; // 전화에서 한 문장으로 소개
  featured?: boolean; // 손님이 고르지 못할 때 티제가 추천하는 상품
  where: Record<Locale, string>; // 살 수 있는 곳(구매 링크·매장 위치), 손님 언어별
};

export const PRODUCTS: Product[] = [
  {
    id: "uiq-cream-mist",
    name: "유아이큐 바이옴 베리어 크림 미스트 1+1",
    nameEn: "UIQ Biome Barrier Cream Mist (Buy 1 Get 1)",
    price: 5000,
    pitch: "물과 크림 사이, 크림을 그대로 뿌리는 미스트예요. 오늘 라이브 특가로 1+1에 채널 쿠폰까지 드려요.",
    featured: true,
    where: {
      ko: "트라가티제 인스타그램 프로필 링크에서 바로 살 수 있어요.",
      en: "You can buy it from the link in the Tragatize Instagram profile.",
      ja: "Tragatize の Instagram プロフィールのリンクから購入できます。",
      "zh-CN": "可通过 Tragatize Instagram 主页里的链接直接购买。",
      "zh-TW": "可透過 Tragatize Instagram 個人檔案裡的連結直接購買。",
      vi: "Bạn có thể mua qua đường link trên trang cá nhân Instagram của Tragatize.",
      th: "ซื้อได้จากลิงก์ในโปรไฟล์ Instagram ของ Tragatize",
    },
  },
  {
    id: "cry-cheeseburger",
    name: "크라이 치즈버거",
    nameEn: "Cry Cheeseburger",
    price: 5000,
    pitch: "매니저가 직접 만든, 치즈와 토마토를 아낌없이 넣은 수제 버거예요.",
    where: {
      ko: "강남역 근처 매장에서 드실 수 있어요. 지도 앱에서 «크라이 치즈버거» 를 검색해 주세요.",
      en: "Visit our shop near Gangnam Station — search “Cry Cheeseburger” in your map app.",
      ja: "江南駅近くのお店で召し上がれます。地図アプリで「Cry Cheeseburger」を検索してください。",
      "zh-CN": "可到江南站附近的门店品尝，请在地图 App 搜索“Cry Cheeseburger”。",
      "zh-TW": "可到江南站附近的門市品嚐，請在地圖 App 搜尋「Cry Cheeseburger」。",
      vi: "Mời bạn ghé quán gần ga Gangnam — tìm “Cry Cheeseburger” trên ứng dụng bản đồ.",
      th: "แวะทานได้ที่ร้านใกล้สถานีคังนัม ค้นหา “Cry Cheeseburger” ในแอปแผนที่",
    },
  },
  {
    id: "seongsu-knit-cardigan",
    name: "성수 니트 가디건",
    nameEn: "Seongsu Knit Cardigan",
    price: 39000,
    pitch: "성수에서 직접 만든 도톰한 니트 가디건이에요. 크림·차콜·세이지 세 가지 색이 있어요.",
    where: {
      ko: "성수동 매장이나 인스타그램 프로필 링크에서 살 수 있어요.",
      en: "Available at our Seongsu shop or via the link in our Instagram profile.",
      ja: "聖水洞のお店、または Instagram プロフィールのリンクから購入できます。",
      "zh-CN": "可在圣水洞门店或通过 Instagram 主页链接购买。",
      "zh-TW": "可在聖水洞門市或透過 Instagram 個人檔案連結購買。",
      vi: "Có bán tại cửa hàng ở Seongsu hoặc qua link trên trang cá nhân Instagram.",
      th: "ซื้อได้ที่ร้านย่านซองซู หรือผ่านลิงก์ในโปรไฟล์ Instagram",
    },
  },
];

export function findProduct(query: string): Product | undefined {
  const q = query.replace(/\s/g, "").toLowerCase();
  return PRODUCTS.find(
    (p) =>
      p.id === query ||
      p.name.replace(/\s/g, "").toLowerCase().includes(q) ||
      q.includes(p.name.replace(/\s/g, "").toLowerCase().slice(0, 4)) ||
      (p.id === "uiq-cream-mist" && /유아이|ui|미스트|mist/i.test(query)) ||
      (p.id === "cry-cheeseburger" && /버거|burger/i.test(query)) ||
      (p.id === "seongsu-knit-cardigan" && /니트|가디건|knit|cardigan/i.test(query)) ||
      p.nameEn.toLowerCase().includes(query.toLowerCase()),
  );
}

export function won(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}
