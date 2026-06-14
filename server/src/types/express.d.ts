import type { Role } from "../models/enums.js";

/** Ator autenticado anexado à requisição pela camada de autenticação. */
export interface AuthActor {
  id: string; // _id do usuário local
  clerkId: string;
  role: Role;
  displayName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: AuthActor;
    }
  }
}

export {};
