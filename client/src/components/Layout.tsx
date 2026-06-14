import { NavLink, Outlet } from "react-router-dom";
import { useSession } from "../auth/SessionContext";
import { UserSwitcher } from "./UserSwitcher";
import { PlayerBar } from "./PlayerBar";

function navClass({ isActive }: { isActive: boolean }) {
  return `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? "bg-boteco-amber text-boteco-bg" : "text-boteco-cream/80 hover:bg-boteco-card"
  }`;
}

export function Layout() {
  const { session } = useSession();
  const isCurator = session?.role === "curator" || session?.role === "admin";
  const isAdmin = session?.role === "admin";

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 backdrop-blur bg-boteco-bg/80 border-b border-white/5">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display text-2xl text-boteco-amber">Botecofy 🍺</span>
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
          </div>
          <UserSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {session ? (
          <Outlet />
        ) : (
          <div className="card p-10 text-center mt-10">
            <h2 className="font-display text-3xl text-boteco-amber mb-2">Puxa uma cadeira 🍻</h2>
            <p className="text-boteco-cream/70">
              Escolha um usuário em <strong>"Entrar como…"</strong> no topo para começar a ouvir.
            </p>
          </div>
        )}
      </main>

      <PlayerBar />
    </div>
  );
}
