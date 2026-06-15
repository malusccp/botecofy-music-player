import type { Request } from "express";
import type { AuthProvider, ResolvedIdentity } from "../middlewares/authProvider.js";
import type { Role } from "../models/enums.js";

/**
 * AuthProvider para TESTES apenas. Lê a identidade de headers `x-test-*`.
 * Não é referenciado pelo container de produção (buildContainer usa o
 * ClerkAuthProvider), portanto não constitui um "modo dev" no app real.
 */
export class FakeAuthProvider implements AuthProvider {
  async resolve(req: Request): Promise<ResolvedIdentity | null> {
    const id = req.header("x-test-user-id");
    if (!id) return null;
    const role = (req.header("x-test-role") as Role | undefined) ?? "listener";
    const name = req.header("x-test-name") ?? id;
    return {
      clerkId: `test:${id}`,
      email: `${id}@test.local`,
      displayName: name,
      role,
    };
  }
}
