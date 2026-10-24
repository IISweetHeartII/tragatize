import { KDH, kdhPhone } from "@/lib/kdh";

// 폰에서 열면 «연락처에 추가» 화면이 뜨는 vCard.
export async function GET(): Promise<Response> {
  const phone = kdhPhone();
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:김;덕환;;;`,
    `FN:${KDH.name}`,
    `ORG:${KDH.org}`,
    `TITLE:${KDH.title}`,
    ...(phone ? [`TEL;TYPE=CELL:+82${phone.replace(/^0/, "")}`] : []),
    `URL:${KDH.site}`,
    `NOTE:Team Tragatize · Ambition for Korea 2026`,
    "END:VCARD",
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"kim-deokhwan.vcf\"",
      "Cache-Control": "no-store",
    },
  });
}
