import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { env } from "../config/env.js";
import type { UserService } from "../services/UserService.js";
import type { Role } from "../models/enums.js";
import { UnauthorizedError } from "../errors/AppError.js";

/**
 * Autenticação. Em produção usa o Clerk; sem CLERK_SECRET_KEY entra em MODO DEV
 * (headers `x-dev-user-id`, `x-dev-role`, `x-dev-name`) para permitir demonstrar
 * o sistema sem configuração externa. Em ambos os casos provisiona o usuário
 * local (RN10) e anexa `req.actor`.
 */
export function attachUser(userService: UserService): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      let clerkId: string | null = null;
      let displayName = "Ouvinte";
      let devRole: Role | undefined;

      if (env.authDevMode) {
        const headerId = req.header("x-dev-user-id");
        if (headerId) {
          clerkId = `dev:${headerId}`;
          displayName = req.header("x-dev-name") ?? headerId;
          devRole = (req.header("x-dev-role") as Role | undefined) ?? "listener";
        }
      } else {
        const auth = getAuth(req);
        if (auth.userId) {
          clerkId = auth.userId;
          displayName = ((auth.sessionClaims as Record<string, unknown> | null)?.name as string) ?? "Ouvinte";
        }
      }

      if (clerkId) {
        const user = await userService.provision({ clerkId, displayName, role: devRole });
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
