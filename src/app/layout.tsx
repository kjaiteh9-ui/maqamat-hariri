import type { Metadata } from "next";
import { Amiri } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "مقامات الحريري — شرح جملة بجملة",
  description:
    "شرح تفصيلي لمقامات الحريري: إعراب، صرف، بلاغة، ومعنى — جملة بجملة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${amiri.variable} antialiased`}>{children}</body>
    </html>
  );
}
