import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { UserService } from "../services/UserService.js";
import type { AuthProvider } from "./authProvider.js";
import { UnauthorizedError } from "../errors/AppError.js";

/**
 * Autenticação real via Clerk. Resolve a identidade pelo AuthProvider, sincroniza
 * o usuário local (provisiona no 1º acesso — RN10 — e mantém papel/nome) e anexa
 * `req.actor`. Não há mais "modo dev": sem token válido, não há ator.
 */
export function attachUser(userService: UserService, authProvider: AuthProvider): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const identity = await authProvider.resolve(req);
      if (identity) {
        const user = await userService.syncFromAuth(identity);
        req.actor = {
          id: String(user._id),
          clerkId: user.clerkId,
          role: user.role,
          displayName: user.displayName,
        };
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Exige usuário autenticado. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.actor) return next(new UnauthorizedError());
  next();
};
