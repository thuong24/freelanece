import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors/http-errors";

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new UnauthorizedError("Vui lòng đăng nhập để tiếp tục"));
  }
  if (req.user.role !== "ADMIN") {
    return next(new ForbiddenError("Chỉ quản trị viên mới có quyền thực hiện thao tác này"));
  }
  next();
};
