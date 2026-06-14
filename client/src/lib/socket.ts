import { io, type Socket } from "socket.io-client";

/** Conexão única de Socket.io para receber atualizações de curtidas/plays. */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("/", { transports: ["websocket", "polling"] });
  }
  return socket;
}
