import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "랜덤 스핀",
  description: "랜덤 스핀",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
