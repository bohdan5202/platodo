import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/slidebar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Platodo Dashboard",
  description: "Platodo - UI Design System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen bg-[#F7F8FC] text-[#14142B] font-sans">
        <Sidebar />
        <main className="flex-1 p-6 bg-[#F7F8FC] text-[#14142B] overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
