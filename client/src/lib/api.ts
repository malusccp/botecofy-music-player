import axios from "axios";

/**
 * Cliente HTTP. Anexa o token JWT real do Clerk (Authorization: Bearer) em
 * cada requisição. O backend valida esse token e resolve o papel do usuário.
 */
export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use(async (config) => {
  // window.Clerk é exposto pelo ClerkProvider após o carregamento.
  const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk;
  const token = clerk?.session ? await clerk.session.getToken() : null;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
