import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">Đăng nhập</h2>
        <p className="text-slate-400 text-sm mt-1">Chào mừng bạn trở lại</p>
      </div>
      <LoginForm />
    </div>
  );
}
