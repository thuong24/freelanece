"use client";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { authApi } from "@/lib/api/auth.api";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    google: any;
    onGoogleLibraryLoad: () => void;
    __GSI_INITIALIZED__?: boolean;
  }
}

export const GoogleOneTap = () => {
  const { isAuthenticated, setAuth } = useAuthStore();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Không chạy nếu đã đăng nhập hoặc chưa có Client ID hợp lệ
    if (isAuthenticated || !clientId || clientId.includes("your_google_client_id")) {
      return;
    }

    // Tránh khởi tạo nhiều lần (đặc biệt trong React Strict Mode)
    if (hasInitialized.current || window.__GSI_INITIALIZED__) {
      return;
    }

    const handleGoogleResponse = async (response: any) => {
      try {
        const res = await authApi.googleOneTap(response.credential);
        const { user, accessToken } = res.data.data;
        setAuth(user, accessToken);

        // Lưu role vào cookie cho middleware
        document.cookie = `userRole=${user.role}; path=/; max-age=2592000`;

        toast.success(`Chào mừng trở lại, ${user.name}!`, {
          icon: "👋",
          style: {
            borderRadius: "12px",
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155"
          }
        });
      } catch (error: any) {
        console.error("Google One Tap Error:", error);
      }
    };

    const initializeOneTap = () => {
      if (!window.google || window.__GSI_INITIALIZED__) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          use_fedcm_for_prompt: false, // Tắt FedCM ở localhost để tránh lỗi NetworkError
          cancel_on_tap_outside: true,
        });

        window.__GSI_INITIALIZED__ = true;
        hasInitialized.current = true;

        // Hiển thị prompt One Tap
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
            // Nếu bị chặn do user tắt quá nhiều, ta reset flag để lần sau (hoặc khi bấm nút) có thể gọi lại
            if (notification.getNotDisplayedReason() === "skipped_by_user" || notification.getNotDisplayedReason() === "unsupported_platform") {
              window.__GSI_INITIALIZED__ = false;
              hasInitialized.current = false;
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize Google One Tap:", err);
      }
    };

    // Nếu script đã load xong trước đó
    if (window.google) {
      initializeOneTap();
    } else {
      // Đợi script load xong
      window.onGoogleLibraryLoad = initializeOneTap;
    }

    return () => {
      // Hủy prompt khi component unmount
      if (window.google) {
        window.google.accounts.id.cancel();
      }
    };
  }, [isAuthenticated, clientId, setAuth]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.onGoogleLibraryLoad) window.onGoogleLibraryLoad();
      }}
    />
  );
};
