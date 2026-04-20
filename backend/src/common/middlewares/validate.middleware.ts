import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../errors/http-errors";

// Higher-order function: nhận Zod schema, trả middleware validate request
export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      
      // Override the property to bypass getter-only errors in Express 5
      Object.defineProperty(req, source, {
        value: parsed,
        writable: true,
        enumerable: true,
        configurable: true
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Chuyển lỗi Zod thành format thân thiện
        const details: Record<string, string[]> = {};
        err.issues.forEach((issue) => {
          const key = issue.path.join(".") || "root";
          if (!details[key]) details[key] = [];
          details[key].push(issue.message);
        });
        next(new ValidationError("Dữ liệu đầu vào không hợp lệ", details));
      } else {
        next(err);
      }
    }
  };
};
