import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "pobedacargo1 - Admin Panel",
  description: "Системаи идоракунии логистикии Победа Карго",
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tj">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hash.includes('tgWebAppData')) {
                sessionStorage.setItem('tgWebAppData', window.location.hash);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
