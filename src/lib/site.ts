export const SITE_URL: string = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tragatize.log8.kr";
export const SITE_NAME = "Tragatize";
export const SITE_TITLE = "Tragatize — 한국에서 세계로";
export const SITE_DESCRIPTION =
  "상품 하나면 홍보도 응대도 끝. AI 대본·AI 홍보 영상·숏폼·SNS 업로드·AI 전화 응대까지, 소상공인을 위한 홍보 자동화.";
export const BRAND_ACCENT = "#e5484d";
// 숏폼에 넣는 AI 전화 문의 번호(ClawOps 070, AI 티제가 받는다)
export const ORDER_PHONE = "070-5276-7530";
// 랜딩 데모 영상: 스튜디오를 실제로 쓰는 화면 녹화(직접 촬영·AI 홍보 영상 흐름, 소리 없음). 대본·숏폼 분석은 실제 AI 호출
// 영상은 Vercel Blob 공개 파일, 포스터는 public/demo
export const DEMO_VIDEOS = {
  lite: {
    src: "https://sogcl1qpjpnao31d.public.blob.vercel-storage.com/media/tragatize-demo-lite-h2ylA3OcqQms9W8Zj6dibEYh4rGpH0.mp4",
    poster: "/demo/tragatize-demo-lite-poster.jpg",
  },
  premium: {
    src: "https://sogcl1qpjpnao31d.public.blob.vercel-storage.com/media/tragatize-demo-premium-qnlS6CtV63RMpwu5WI5e8hPTZgI43o.mp4",
    poster: "/demo/tragatize-demo-premium-poster.jpg",
  },
} as const;
