// Admin Layout
import { redirect } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <span className="text-red-400 font-bold text-lg">🛡️ Admin Panel</span>
          <a href="/admin" className="text-slate-300 hover:text-white text-sm">Dashboard</a>
          <a href="/admin/users" className="text-slate-300 hover:text-white text-sm">Users</a>
          <a href="/admin/disputes" className="text-slate-300 hover:text-white text-sm">Disputes</a>
          <a href="/dashboard" className="ml-auto text-slate-400 hover:text-white text-sm">← Về app</a>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
