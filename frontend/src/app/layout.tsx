import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UpCareer - Việc Làm IT Hàng Đầu Việt Nam & Cổng Quản Trị Nhân Sự AI",
  description: "Hệ sinh thái Tuyển dụng & Quản trị Nhân sự IT hàng đầu Việt Nam",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      translate="no"
      className={`${inter.variable} font-sans h-full antialiased notranslate`}
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full max-w-full notranslate">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

