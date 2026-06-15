import { NavLink, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, UserButton } from "@clerk/clerk-react";
import { useIsAdmin, useIsCurator } from "../auth/useMe";
import { PlayerBar } from "./PlayerBar";

function navClass({ isActive }: { isActive: boolean }) {
  return `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? "bg-boteco-green text-white" : "text-boteco-ink/80 hover:bg-boteco-green/10"
  }`;
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo.png"
        alt="Botecofy"
        className="h-11 w-11 rounded-full object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <span className="font-display text-2xl text-boteco-green-dark">
        Boteco<span className="text-boteco-red">fy</span> 🍺
      </span>
    </div>
  );
}

function AuthedNav() {
  const isCurator = useIsCurator();
  const isAdmin = useIsAdmin();
  return (
    <nav className="flex items-center gap-1">
      <NavLink to="/" end className={navClass}>
        Descobrir
      </NavLink>
      <NavLink to="/playlists" className={navClass}>
        Playlists
      </NavLink>
      <NavLink to="/perfil" className={navClass}>
        Perfil
      </NavLink>
      {isCurator && (
        <NavLink to="/enviar" className={navClass}>
          Enviar faixa
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/moderacao" className={navClass}>
          Moderação
        </NavLink>
      )}
    </nav>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 backdrop-blur bg-boteco-cream/85 border-b border-boteco-ink/10">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Brand />
            <SignedIn>
              <AuthedNav />
            </SignedIn>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <SignedIn>
          <Outlet />
        </SignedIn>
        <SignedOut>
          <div className="flex flex-col items-center gap-6 mt-8">
            <div className="card p-8 text-center max-w-md">
              <h2 className="font-display text-3xl text-boteco-green-dark mb-2">Puxa uma cadeira 🍻</h2>
              <p className="text-boteco-muted">
                Entre para ouvir a curadoria de brega, pagode, sertanejo e arrocha do Botecofy.
              </p>
            </div>
            <SignIn routing="hash" />
          </div>
        </SignedOut>
      </main>

      <SignedIn>
        <PlayerBar />
      </SignedIn>
    </div>
  );
}
