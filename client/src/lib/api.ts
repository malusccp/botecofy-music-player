import axios from "axios";

/**
 * Cliente HTTP. Injeta os headers do MODO DEV de autenticação a partir da
 * sessão guardada no localStorage. Quando o Clerk estiver configurado, o token
 * seria injetado aqui no lugar desses headers.
 */
export interface DevSession {
  id: string;
  name: string;
  role: "listener" | "curator" | "admin";
}

const STORAGE_KEY = "botecofy.session";

export function getSession(): DevSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as DevSession) : null;
}

export function setSession(session: DevSession | null): void {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
}

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const session = getSession();
  if (session) {
    config.headers.set("x-dev-user-id", session.id);
    config.headers.set("x-dev-role", session.role);
    config.headers.set("x-dev-name", session.name);
  }
  return config;
});
