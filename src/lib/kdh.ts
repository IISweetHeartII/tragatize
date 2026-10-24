import "server-only";

// 김덕환 디지털 명함. 공개 레포라 전화번호는 코드에 두지 않고 Vercel 환경변수 KDH_PHONE 에서 읽는다.
export const KDH = {
  name: "김덕환",
  nameEn: "Deokhwan Kim",
  title: "AI Native Engineer",
  org: "퍼플페퍼",
  photo: "https://github.com/IISweetHeartII.png?size=400",
  github: "https://github.com/IISweetHeartII",
  site: "https://log8.kr",
};

export function kdhPhone(): string | null {
  const raw = (process.env.KDH_PHONE ?? "").replace(/\D/g, "");
  return raw.length >= 10 ? raw : null;
}

// 010-1234-5678 꼴로 보여 준다.
export function prettyPhone(digits: string): string {
  return digits.length === 11 ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}` : digits;
}
