import type { Metadata } from "next";
import { Merriweather, Lato, Geist_Mono } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tulumbak Admin - Yönetim Paneli",
  description: "Tulumbak e-ticaret yönetim paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${merriweather.variable} ${lato.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
