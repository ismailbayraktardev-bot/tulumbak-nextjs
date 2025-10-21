import type { Metadata } from "next";
import { Merriweather, Lato, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

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
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
