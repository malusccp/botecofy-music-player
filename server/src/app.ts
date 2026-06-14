import express, { type Express } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env.js";
import { buildContainer, type Container, UPLOADS_DIR } from "./config/container.js";
import { buildApiRouter } from "./routes/index.js";
import { attachUser } from "./middlewares/auth.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

/**
 * Fábrica do app Express (camada de apresentação). Recebe o container por
 * parâmetro para facilitar testes (DIP).
 */
export function createApp(container: Container = buildContainer()): { app: Express; container: Container } {
  const app = express();

  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());

  // Arquivos de áudio/capa do MVP servidos estaticamente, com suporte a Range
  // (seek) que o Express já provê via send.
  app.use("/uploads", express.static(UPLOADS_DIR, { acceptRanges: true }));

  // Clerk só é montado quando há chaves; sem elas, a autenticação roda em modo DEV.
  if (!env.authDevMode) {
    app.use(clerkMiddleware());
  }
  app.use(attachUser(container.userService));

  app.use("/api", buildApiRouter(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, container };
}
