import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "./providers";
import { Toaster } from "react-hot-toast";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreelanceEscrow — Nền tảng freelance an toàn",
  description: "Kết nối client và freelancer với hệ thống escrow bảo đảm thanh toán minh bạch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`} suppressHydrationWarning>
        <ReactQueryProvider>
          <Toaster position="top-right" />
          <GoogleOneTap />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
