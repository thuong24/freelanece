"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLogout } from "@/lib/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { cn } from "@/lib/utils/cn";
import { Bell, Briefcase, FileText, LogOut, Settings, User, Wallet, Menu, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout } = useLogout();
  const { unreadCount } = useNotificationStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Đóng mobile menu khi chuyển hướng
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/jobs", label: "Tìm việc", icon: Briefcase },
    { href: "/contracts", label: "Hợp đồng", icon: FileText },
    { href: "/wallet", label: "Ví", icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-6">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="text-indigo-400 font-bold text-lg md:text-xl tracking-tight shrink-0">
          FreelanceEscrow
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Link
                href="/notifications"
                className={cn(
                  "relative p-2 rounded-lg transition-all duration-300",
                  unreadCount > 0 
                    ? "text-white bg-indigo-600/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                )}
              >
                <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-bell-shake")} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-subtle shadow-lg shadow-red-500/50">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  {user && <Avatar name={user.name} src={user.avatarUrl} size="sm" />}
                  <span className="hidden md:block text-sm text-slate-300 max-w-[120px] truncate">{user?.name}</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-20 py-1.5 overflow-hidden">
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors" onClick={() => setMenuOpen(false)}>
                        <User className="w-4 h-4 text-slate-400" /> Dashboard
                      </Link>
                      <Link href="/settings/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors" onClick={() => setMenuOpen(false)}>
                        <Settings className="w-4 h-4 text-slate-400" /> Cài đặt
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition-colors" onClick={() => setMenuOpen(false)}>
                          🛡️ Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-slate-800 mt-1.5 pt-1.5">
                        <button
                          onClick={() => { logout(); setMenuOpen(false); }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                Đăng nhập
              </Link>
              <Link href="/register" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors font-medium">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 flex flex-col gap-2 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
          
          {isAuthenticated ? (
            <div className="border-t border-slate-800 mt-2 pt-2">
              <div className="px-4 py-3 flex items-center gap-3 mb-2">
                 {user && <Avatar name={user.name} src={user.avatarUrl} size="sm" />}
                 <div>
                   <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                   <p className="text-xs text-slate-500">{user?.role}</p>
                 </div>
              </div>
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <User className="w-5 h-5" /> Dashboard
              </Link>
              <Link href="/settings/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Settings className="w-5 h-5" /> Cài đặt
              </Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors">
                  🛡️ Admin Panel
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-2"
              >
                <LogOut className="w-5 h-5" /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-800 mt-2 pt-4 px-2">
               <Link href="/login" className="flex justify-center items-center w-full bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg transition-colors font-medium">
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
