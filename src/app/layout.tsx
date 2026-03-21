import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Kawaii Ai アイシテル合同会社 // 2045 HARAJUKU",
  description: "KAWAII × AI × 愛 ─ テクノロジーに、やさしさを。AIチャットデモ。",
  openGraph: {
    title: "Kawaii Ai アイシテル // 2045 HARAJUKU",
    description: "KAWAII × AI × 愛 ─ テクノロジーに、やさしさを。",
    url: "https://ai-akari.ai",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kawaii Ai アイシテル // 2045 HARAJUKU",
    description: "KAWAII × AI × 愛 ─ テクノロジーに、やさしさを。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={zenMaruGothic.className}>{children}</body>
    </html>
  );
}
