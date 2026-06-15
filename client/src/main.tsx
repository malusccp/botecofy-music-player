import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const root = ReactDOM.createRoot(document.getElementById("root")!);

if (!publishableKey) {
  // Sem chave do Clerk o app de autenticação real não sobe. Mostra orientação
  // em vez de quebrar com tela branca.
  root.render(
    <div style={{ maxWidth: 560, margin: "80px auto", fontFamily: "system-ui", lineHeight: 1.5 }}>
      <h1 style={{ color: "#0B8A3D" }}>Botecofy 🍺 — configuração necessária</h1>
      <p>
        Defina <code>VITE_CLERK_PUBLISHABLE_KEY</code> em <code>client/.env</code> com a sua
        publishable key do Clerk e reinicie o <code>npm run dev</code>.
      </p>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkProvider>
    </React.StrictMode>
  );
}
