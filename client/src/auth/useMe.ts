import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../lib/queries";
import type { Role } from "../types";

/** Carrega o perfil do usuário autenticado (inclui o papel resolvido pelo backend). */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    // O papel muda raramente: mantém em cache pra não refazer /me (e atrasar o
    // menu) a cada navegação. Sai do cache só ao recarregar a página.
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}

/** Papel atual do usuário, ou undefined enquanto carrega. */
export function useRole(): Role | undefined {
  return useMe().data?.role;
}

export function useIsCurator(): boolean {
  const role = useRole();
  return role === "curator" || role === "admin";
}

export function useIsAdmin(): boolean {
  return useRole() === "admin";
}
