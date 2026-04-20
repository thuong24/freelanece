// Auth group layout — no navbar, centered auth forms
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">FreelanceEscrow</h1>
          </Link>
          <p className="text-slate-400 text-sm mt-1">Nền tảng freelance an toàn & minh bạch</p>
        </div>
        {children}
      </div>
    </div>
  );
}
