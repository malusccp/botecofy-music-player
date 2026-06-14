import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors/AppError.js";

/** Validação de entrada com Zod, na fronteira da apresentação. */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join("; ");
      return next(new ValidationError(msg));
    }
    req.body = result.data;
    next();
  };
}
