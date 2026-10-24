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
    id: "snail-cream",
    name: "달팽이 크림 50ml",
    nameEn: "Snail Repair Cream 50ml",
    price: 19000,
    pitch: "건조한 피부에 수분을 채워 주는 K-뷰티 스테디셀러 크림이에요.",
    featured: true,
  },
  {
    id: "life-story-book",
    name: "부모님 자서전 책",
    nameEn: "Parents' Life Story Book",
    price: 88000,
    pitch: "부모님 목소리로 들은 인생 이야기를 글과 그림으로 엮어 드리는 책이에요.",
  },
];

export function findProduct(query: string): Product | undefined {
  const q = query.replace(/\s/g, "").toLowerCase();
  return PRODUCTS.find(
    (p) =>
      p.id === query ||
      p.name.replace(/\s/g, "").toLowerCase().includes(q) ||
      q.includes(p.name.replace(/\s/g, "").toLowerCase().slice(0, 4)) ||
      p.nameEn.toLowerCase().includes(query.toLowerCase()),
  );
}

export function won(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}
