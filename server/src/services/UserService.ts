import type { IUserRepository } from "../repositories/interfaces.js";
import type { Role } from "../models/enums.js";
import type { UserDoc } from "../models/User.js";
import { NotFoundError } from "../errors/AppError.js";

export interface SyncInput {
  clerkId: string;
  displayName: string;
  role: Role;
}

/**
 * Regras de usuário. RN10: provisiona o usuário no primeiro acesso autenticado,
 * a partir da identidade do Clerk, e mantém papel/nome sincronizados.
 * SOLID/SRP: trata apenas identidade/perfil.
 */
export class UserService {
  constructor(private readonly users: IUserRepository) {}

  /** Cria o usuário local no 1º acesso ou atualiza papel/nome se mudaram. */
  async syncFromAuth(input: SyncInput): Promise<UserDoc> {
    const existing = await this.users.findByClerkId(input.clerkId);
    if (!existing) {
      return this.users.create({
        clerkId: input.clerkId,
        displayName: input.displayName || "Ouvinte",
        role: input.role,
      });
    }

    if (existing.role !== input.role || existing.displayName !== input.displayName) {
      existing.role = input.role;
      existing.displayName = input.displayName || existing.displayName;
      await existing.save();
    }
    return existing;
  }

  async getById(id: string): Promise<UserDoc> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError("Usuário não encontrado.");
    return user;
  }
}
