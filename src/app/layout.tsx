import type { Metadata, Viewport } from "next";
import { Anton, Black_Han_Sans, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 랜딩 큰 제목용 압축 대문자 서체(영문 Anton, 한글 Black Han Sans). 본문은 Geist 그대로.
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin", "latin-ext", "vietnamese"] });
const blackHanSans = Black_Han_Sans({ variable: "--font-bhs", weight: "400", subsets: ["latin"], preload: false });

// 아이콘·OG 이미지 <link>/<meta> 는 파일 규칙(app/icon.tsx · apple-icon.tsx · opengraph-image.tsx)이 만든다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["Tragatize", "트라가티제", "Ambition for Korea", "해커톤", "글로벌", "AI"],
  authors: [{ name: "Team Tragatize" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f2ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${blackHanSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
