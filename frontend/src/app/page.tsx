import { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "FreelanceEscrow — Nền tảng Freelance An toàn & Minh bạch",
  description: "Kết nối Client và Freelancer thông qua hệ thống Escrow hiện đại. Bảo vệ thanh toán, phân xử công minh, việc làm chất lượng cao.",
  keywords: ["freelance", "escrow", "việc làm", "tuyển dụng", "freelancer việt nam", "thanh toán an toàn"],
  openGraph: {
    title: "FreelanceEscrow — Nền tảng Freelance An toàn & Minh bạch",
    description: "Kết nối tài năng, bảo chứng niềm tin với hệ thống Escrow thế hệ mới.",
    type: "website",
    locale: "vi_VN",
  }
};

export default function RootPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20">
        <HomeContent />
      </div>
    </main>
  );
}
