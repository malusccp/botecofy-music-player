import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { setupSockets } from "./sockets/index.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();

  const { app, container } = createApp();
  const httpServer = createServer(app);
  setupSockets(httpServer, container.notifier);

  httpServer.listen(env.port, () => {
    console.log(`[botecofy] API em http://localhost:${env.port}`);
    console.log(`[botecofy] autenticação: ${env.authDevMode ? "MODO DEV (headers)" : "Clerk"}`);
  });
}

bootstrap().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
  process.exit(1);
});
