import type { IUserRepository } from "../repositories/interfaces.js";
import type { Role } from "../models/enums.js";
import type { UserDoc } from "../models/User.js";
import { NotFoundError } from "../errors/AppError.js";

export interface ProvisionInput {
  clerkId: string;
  displayName: string;
  role?: Role;
}

/**
 * Regras de usuário. RN10: provisiona o usuário no primeiro acesso autenticado,
 * a partir do clerkId. SOLID/SRP: trata apenas identidade/perfil.
 */
export class UserService {
  constructor(private readonly users: IUserRepository) {}

  /** Garante que existe um usuário local para o clerkId; cria se necessário. */
  async provision(input: ProvisionInput): Promise<UserDoc> {
    const existing = await this.users.findByClerkId(input.clerkId);
    if (existing) return existing;

    return this.users.create({
      clerkId: input.clerkId,
      displayName: input.displayName || "Ouvinte",
      role: input.role ?? "listener",
    });
  }

  async getById(id: string): Promise<UserDoc> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError("Usuário não encontrado.");
    return user;
  }
}
