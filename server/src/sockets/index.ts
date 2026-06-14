import type { Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { env } from "../config/env.js";
import type { RealtimeNotifier } from "../services/events/RealtimeNotifier.js";

/**
 * Camada de tempo real. É um OBSERVADOR do RealtimeNotifier (padrão Observer):
 * recebe eventos de domínio e os retransmite aos clientes via Socket.io. O
 * domínio não conhece Socket.io — só emite eventos.
 */
export function setupSockets(httpServer: HttpServer, notifier: RealtimeNotifier): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: { origin: env.clientOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { message: "Conectado ao Botecofy ao vivo." });
  });

  // Inscreve a camada de transporte nos eventos de domínio.
  notifier.subscribe((event) => {
    switch (event.type) {
      case "track:liked":
        io.emit("track:liked", { trackId: event.trackId, likesCount: event.likesCount });
        break;
      case "track:played":
        io.emit("track:played", { trackId: event.trackId, playsCount: event.playsCount });
        break;
    }
  });

  return io;
}
