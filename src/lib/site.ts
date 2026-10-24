export const SITE_URL: string = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tragatize.log8.kr";
export const SITE_NAME = "Tragatize";
export const SITE_TITLE = "Tragatize — 한국에서 세계로";
export const SITE_DESCRIPTION =
  "상품 하나면 홍보도 응대도 끝. AI 대본·AI 홍보 영상·숏폼·SNS 업로드·AI 전화 응대까지, 소상공인을 위한 홍보 자동화.";
export const BRAND_ACCENT = "#e5484d";
// 숏폼에 넣는 AI 전화 문의 번호(ClawOps 070, AI 티제가 받는다)
export const ORDER_PHONE = "070-5276-7530";
// 랜딩 데모 영상: 배포 사이트를 실제로 쓰는 화면 녹화(Lite·Premium 흐름, 소리 없음). Vercel Blob 공개 파일
export const DEMO_VIDEOS = {
  lite: {
    src: "https://sogcl1qpjpnao31d.public.blob.vercel-storage.com/media/tragatize-demo-lite-C7Zd313CGqw6vyjiNPQz9KFMCmFYxo.mp4",
    poster: "https://sogcl1qpjpnao31d.public.blob.vercel-storage.com/media/tragatize-demo-lite-poster-3QkflsQJbCknwAOP7YSmPpCRlHvbfI.jpg",
  },
  premium: {
    src: "https://sogcl1qpjpnao31d.public.blob.vercel-storage.com/media/tragatize-demo-premium-eQIHFUrhZXZ8sWh3lyAulS3G3oKnZ6.mp4",
    poster: "https://sogcl1qpjpnao31d.public.blob.vercel-storage.com/media/tragatize-demo-premium-poster-DGpbZlpBj6qIuLP1V9gxZLaXxK3Gbl.jpg",
  },
} as const;
