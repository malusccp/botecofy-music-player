import { useSession } from "../auth/SessionContext";
import type { DevSession } from "../lib/api";

/**
 * Seletor de usuário do MODO DEV. Simula o login do Clerk escolhendo um dos
 * usuários semeados, permitindo demonstrar as funcionalidades por papel.
 */
const USERS: DevSession[] = [
  { id: "ouvinte", name: "Ouvinte Boteco", role: "listener" },
  { id: "curador", name: "Curador Boteco", role: "curator" },
  { id: "admin", name: "Admin Boteco", role: "admin" },
];

const ROLE_LABEL = { listener: "Ouvinte", curator: "Curador", admin: "Admin" } as const;

export function UserSwitcher() {
  const { session, login, logout } = useSession();

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-full bg-boteco-card border border-boteco-amber/30 px-3 py-1.5 text-sm"
        value={session?.id ?? ""}
        onChange={(e) => {
          const user = USERS.find((u) => u.id === e.target.value);
          if (user) login(user);
          else logout();
        }}
      >
        <option value="">Entrar como…</option>
        {USERS.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({ROLE_LABEL[u.role]})
          </option>
        ))}
      </select>
    </div>
  );
}
