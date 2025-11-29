import type { Metadata } from "next";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";

const font = Be_Vietnam_Pro({
  subsets: ["latin-ext"], 
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bảng Giá Vàng - " + (process.env.SHOP_NAME || "Tiệm Vàng ABC"),
  description: "Bảng giá vàng cập nhật realtime",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={font.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
