import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import { APP_CONSTANTS } from "../../common/constants/app.constants";
import { UnauthorizedError } from "../../common/errors/http-errors";
import * as authService from "./auth.service";
import type { RegisterDto, LoginDto, GoogleOneTapDto } from "./auth.dto";

// Helper: set refresh token cookie HttpOnly
const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(APP_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: APP_CONSTANTS.COOKIE_MAX_AGE_MS,
  });
};

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as RegisterDto;
  const deviceInfo = req.headers["user-agent"];
  const result = await authService.register(dto, deviceInfo);

  setRefreshCookie(res, result.rawRefreshToken);

  return successResponse(
    res,
    "Đăng ký tài khoản thành công",
    { user: result.user, accessToken: result.accessToken },
    201
  );
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as LoginDto;
  const deviceInfo = req.headers["user-agent"];
  const result = await authService.login(dto, deviceInfo);

  setRefreshCookie(res, result.rawRefreshToken);

  return successResponse(res, "Đăng nhập thành công", {
    user: result.user,
    accessToken: result.accessToken,
  });
});

// POST /api/auth/refresh-token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies[APP_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

  if (!rawToken) {
    throw new UnauthorizedError("Không tìm thấy refresh token, vui lòng đăng nhập lại");
  }

  const deviceInfo = req.headers["user-agent"];
  const result = await authService.refreshToken(rawToken, deviceInfo);

  setRefreshCookie(res, result.rawRefreshToken);

  return successResponse(res, "Làm mới token thành công", {
    accessToken: result.accessToken,
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies[APP_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

  if (rawToken) {
    await authService.logout(rawToken);
  }

  // Xóa cookie
  res.clearCookie(APP_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return successResponse(res, "Đăng xuất thành công");
});

// POST /api/auth/google-one-tap
export const googleOneTap = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as GoogleOneTapDto;
  const deviceInfo = req.headers["user-agent"];
  const result = await authService.googleOneTap(dto, deviceInfo);

  setRefreshCookie(res, result.rawRefreshToken);

  return successResponse(res, "Đăng nhập Google thành công", {
    user: result.user,
    accessToken: result.accessToken,
  });
});
