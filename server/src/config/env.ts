import dotenv from "dotenv";

dotenv.config();

/**
 * Configuração central da aplicação, lida do ambiente uma única vez.
 * Ocultamento de informação: o resto do código não acessa `process.env` diretamente.
 */
export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/botecofy",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? "",
  maxAudioBytes: Number(process.env.MAX_AUDIO_BYTES ?? 15 * 1024 * 1024),
  /** Quando não há chave do Clerk, a autenticação roda em modo DEV (headers). */
  get authDevMode(): boolean {
    return this.clerkSecretKey.trim().length === 0;
  },
};
