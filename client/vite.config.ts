import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api e /uploads para o servidor Express em dev.
export default defineConfig({
  plugins: [react()],
  server: {
    // honra PORT quando definido (ex.: ferramentas de preview), senão 5173
    port: Number(process.env.PORT) || 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
      "/socket.io": { target: "http://localhost:4000", ws: true },
    },
  },
});
