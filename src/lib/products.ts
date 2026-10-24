// 전화 주문(AI 티제)·데모에서 쓰는 상품 목록. 실제 판매 상품이 정해지면 여기만 바꾼다.
export type Product = {
  id: string;
  name: string;
  nameEn: string;
  price: number; // 원
  pitch: string; // 전화에서 한 문장으로 소개
  featured?: boolean; // 손님이 고르지 못할 때 티제가 추천하는 상품
};

export const PRODUCTS: Product[] = [
  {
    id: "uiq-cream-mist",
    name: "유아이큐 바이옴 베리어 크림 미스트 1+1",
    nameEn: "UIQ Biome Barrier Cream Mist (Buy 1 Get 1)",
    price: 5000,
    pitch: "물과 크림 사이, 크림을 그대로 뿌리는 미스트예요. 오늘 라이브 특가로 1+1에 채널 쿠폰까지 드려요.",
    featured: true,
  },
  {
    id: "cry-cheeseburger",
    name: "크라이 치즈버거",
    nameEn: "Cry Cheeseburger",
    price: 5000,
    pitch: "매니저가 직접 만든, 치즈와 토마토를 아낌없이 넣은 수제 버거예요.",
  },
  {
    id: "seongsu-knit-cardigan",
    name: "성수 니트 가디건",
    nameEn: "Seongsu Knit Cardigan",
    price: 39000,
    pitch: "성수에서 직접 만든 도톰한 니트 가디건이에요. 크림·차콜·세이지 세 가지 색이 있어요.",
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
