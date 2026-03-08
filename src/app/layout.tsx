import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kawaii Ai アイシテル合同会社 // 2045 HARAJUKU",
  description: "ありがとう Kawaii Ai アイシテル合同会社",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
