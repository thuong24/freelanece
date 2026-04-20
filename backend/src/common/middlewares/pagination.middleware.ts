import { Request, Response, NextFunction } from "express";

export const paginationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;

  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
};
