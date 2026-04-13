import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IT Management System - Quản trị hệ thống IT",
  description: "Hệ thống quản lý IT - Tài sản, Nhật ký công việc, Cases, Quản lý mạng",
  keywords: ["Quản trị IT", "Tài sản", "Mạng", "Nhật ký công việc"],
  authors: [{ name: "Chanh Phan IT" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
