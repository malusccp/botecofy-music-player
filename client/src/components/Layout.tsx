import { Outlet } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { PlayerBar } from "./PlayerBar";
import { AuthScreen } from "./AuthScreen";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <>
      {/* Deslogado: tela de boteco festiva em tela cheia (com a própria logo). */}
      <SignedOut>
        <AuthScreen />
      </SignedOut>

      {/* Logado: shell estilo app de música (top bar + biblioteca + conteúdo + player),
          com a identidade Botecofy (marinho, creme, verde, amarelo, vermelho). */}
      <SignedIn>
        <div className="boteco-app-bg flex h-screen flex-col gap-2 p-2">
          <TopBar />

          <div className="flex min-h-0 flex-1 gap-2">
            <Sidebar />
            <main className="relative min-h-0 flex-1 overflow-y-auto rounded-xl bg-boteco-base">
              <Outlet />
            </main>
          </div>

          <PlayerBar />
        </div>
      </SignedIn>
    </>
  );
}
