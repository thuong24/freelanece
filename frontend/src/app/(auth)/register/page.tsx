import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">Tạo tài khoản</h2>
        <p className="text-slate-400 text-sm mt-1">Tham gia cộng đồng FreelanceEscrow ngay hôm nay</p>
      </div>
      <RegisterForm />
    </div>
  );
}
