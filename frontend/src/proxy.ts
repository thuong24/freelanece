import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/jobs/create", "/contracts", "/wallet", "/settings", "/notifications", "/disputes"];
const ADMIN_PATHS = ["/admin"];
const GUEST_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cookie httpOnly do backend set khi login thành công
  const hasRefreshToken = request.cookies.has("refreshToken");
  const userRole = request.cookies.get("userRole")?.value;

  // Guest paths: vẫn cho phép truy cập để người dùng có thể đăng nhập lại nếu cookie bị lỗi (state desync)
  if (GUEST_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Protected paths: nếu CHƯA đăng nhập thì redirect về login
  if (PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!hasRefreshToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Admin paths
  if (ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/create",
    "/contracts/:path*",
    "/wallet/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/disputes/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
