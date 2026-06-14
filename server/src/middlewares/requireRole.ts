import type { RequestHandler } from "express";
import type { Role } from "../models/enums.js";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";

/** Autorização por papel (RN03 nas rotas de curadoria/moderação). */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.actor) return next(new UnauthorizedError());
    if (!roles.includes(req.actor.role)) {
      return next(new ForbiddenError("Seu perfil não tem permissão para esta ação."));
    }
    next();
  };
}
