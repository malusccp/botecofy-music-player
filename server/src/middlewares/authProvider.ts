import type { Request } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import type { Role } from "../models/enums.js";

/** Identidade resolvida a partir do provedor de autenticação. */
export interface ResolvedIdentity {
  clerkId: string;
  email: string;
  displayName: string;
  role: Role;
}

/**
 * Abstração de autenticação (SOLID/DIP). A aplicação depende desta interface,
 * não do Clerk diretamente — o que também permite injetar um provedor falso
 * nos testes sem reintroduzir "modo dev" no código de produção.
 */
export interface AuthProvider {
  resolve(req: Request): Promise<ResolvedIdentity | null>;
}

/**
 * Provedor real: valida o JWT do Clerk (via clerkMiddleware/getAuth) e busca
 * os dados do usuário para resolver o papel.
 *
 * Ordem de resolução do papel:
 *   1. publicMetadata.role no Clerk (listener | curator | admin)
 *   2. e-mail presente em ADMIN_EMAILS / CURATOR_EMAILS (bootstrap)
 *   3. listener (padrão)
 */
export class ClerkAuthProvider implements AuthProvider {
  // Cache curto da identidade por usuário: evita chamar o Clerk pela rede em
  // toda requisição (o que adicionava latência e atrasava o carregamento do
  // papel/menu no front). Mudanças de papel refletem em até `ttlMs`.
  private readonly cache = new Map<string, { identity: ResolvedIdentity; expires: number }>();
  private readonly ttlMs = 60_000;

  constructor(
    private readonly adminEmails: string[],
    private readonly curatorEmails: string[]
  ) {}

  async resolve(req: Request): Promise<ResolvedIdentity | null> {
    const { userId } = getAuth(req);
    if (!userId) return null;

    const cached = this.cache.get(userId);
    if (cached && cached.expires > Date.now()) return cached.identity;

    const user = await clerkClient.users.getUser(userId);
    const email = (
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      ""
    ).toLowerCase();
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      email ||
      "Ouvinte";

    const identity: ResolvedIdentity = {
      clerkId: userId,
      email,
      displayName,
      role: this.resolveRole(email, user.publicMetadata?.role),
    };
    this.cache.set(userId, { identity, expires: Date.now() + this.ttlMs });
    return identity;
  }

  private resolveRole(email: string, metaRole: unknown): Role {
    if (metaRole === "admin" || metaRole === "curator" || metaRole === "listener") {
      return metaRole;
    }
    if (this.adminEmails.includes(email)) return "admin";
    if (this.curatorEmails.includes(email)) return "curator";
    return "listener";
  }
}
