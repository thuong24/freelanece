import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../config/jwt";
import { prisma } from "../../config/prisma";
import { UnauthorizedError, ForbiddenError } from "../errors/http-errors";
import { ERROR_CODES } from "../constants/error-codes";

// Mở rộng Express Request để có thể gắn user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        status: string;
      };
    }
  }
}

// Middleware xác thực JWT — gắn req.user nếu hợp lệ
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Vui lòng đăng nhập để tiếp tục");
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Kiểm tra user vẫn tồn tại và không bị ban
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedError("Tài khoản không tồn tại");
    }

    if (user.status === "BANNED") {
      throw new ForbiddenError("Tài khoản của bạn đã bị khóa vĩnh viễn");
    }

    if (user.status === "SUSPENDED") {
      throw new ForbiddenError("Tài khoản của bạn đang bị tạm đình chỉ");
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    // Phân biệt lỗi token hết hạn vs không hợp lệ
    if (err instanceof Error && err.name === "TokenExpiredError") {
      next(new UnauthorizedError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"));
    } else if (err instanceof Error && err.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Token không hợp lệ"));
    } else {
      next(err);
    }
  }
};


