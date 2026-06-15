import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { setupSockets } from "./sockets/index.js";
import { env } from "./config/env.js";

async function bootstrap() {
  if (!env.clerkConfigured) {
    console.warn(
      "[botecofy] AVISO: CLERK_SECRET_KEY não definido. O app exige Clerk para autenticar — preencha server/.env."
    );
  }

  await connectDatabase();

  const { app, container } = createApp();
  const httpServer = createServer(app);
  setupSockets(httpServer, container.notifier);

  httpServer.listen(env.port, () => {
    console.log(`[botecofy] API em http://localhost:${env.port}`);
    console.log(`[botecofy] autenticação: Clerk (${env.clerkConfigured ? "configurado" : "NÃO configurado"})`);
  });
}

bootstrap().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
  process.exit(1);
});
