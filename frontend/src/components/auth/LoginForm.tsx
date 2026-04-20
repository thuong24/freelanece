"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { useLogin } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <form onSubmit={handleSubmit((d) => login(d))} className="space-y-5">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Mật khẩu"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" fullWidth loading={isPending} size="lg">
        Đăng nhập
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500">Hoặc</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        size="lg"
        className="bg-white text-slate-900 hover:bg-slate-100 border-none"
        onClick={() => {
           if (window.google) {
             // Đảm bảo đã initialize ít nhất một lần trước khi prompt
             window.google.accounts.id.initialize({
               client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
               callback: async (response: any) => {
                 // Gọi API đăng nhập tương tự như One Tap
                 const { authApi } = await import("@/lib/api/auth.api");
                 const res = await authApi.googleOneTap(response.credential);
                 const { user, accessToken } = res.data.data;
                 useAuthStore.getState().setAuth(user, accessToken);
                 document.cookie = `userRole=${user.role}; path=/; max-age=2592000`;
                 window.location.href = user.role === "ADMIN" ? "/admin" : "/dashboard";
               }
             });
             window.google.accounts.id.prompt();
           }
        }}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Tiếp tục với Google
      </Button>

      <p className="text-center text-sm text-slate-400">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
