import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getSession, setSession, type DevSession } from "../lib/api";

/** Sessão de usuário (MODO DEV). Trocar de usuário re-renderiza o app. */
interface SessionCtx {
  session: DevSession | null;
  login: (session: DevSession) => void;
  logout: () => void;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setLocal] = useState<DevSession | null>(() => getSession());

  const value = useMemo<SessionCtx>(
    () => ({
      session,
      login: (s) => {
        setSession(s);
        setLocal(s);
      },
      logout: () => {
        setSession(null);
        setLocal(null);
      },
    }),
    [session]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession deve ser usado dentro de SessionProvider");
  return ctx;
}
