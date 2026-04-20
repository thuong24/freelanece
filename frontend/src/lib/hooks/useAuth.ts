"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { authApi } from "@/lib/api/auth.api";
import { Alert } from "@/lib/utils/alert";

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      // Lưu role vào cookie để middleware đọc
      document.cookie = `userRole=${user.role}; path=/; max-age=2592000`;
      Alert.toast("Đăng nhập thành công!", "success");
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Sai email hoặc mật khẩu";
      Alert.error(msg);
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) => authApi.register(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      document.cookie = `userRole=${user.role}; path=/; max-age=2592000`;
      Alert.toast("Đăng ký thành công! Chào mừng bạn.", "success");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
      Alert.error(msg);
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      document.cookie = "userRole=; path=/; max-age=0";
      router.push("/login");
    },
    onError: () => {
      clearAuth();
      router.push("/login");
    },
  });
};

export const useGoogleLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credential: string) => authApi.googleOneTap(credential),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      document.cookie = `userRole=${user.role}; path=/; max-age=2592000`;
      Alert.toast(`Chào mừng trở lại, ${user.name}!`, "success");
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Đăng nhập Google thất bại";
      Alert.error(msg);
    },
  });
};
