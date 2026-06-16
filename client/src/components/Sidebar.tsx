import { NavLink, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFollowedPlaylists } from "../lib/queries";
import { useIsAdmin, useIsCurator } from "../auth/useMe";
import {
  HomeIcon,
  PlaylistIcon,
  PlusIcon,
  ShieldIcon,
  UploadIcon,
  UserIcon,
} from "./icons";

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-4 rounded-lg px-4 py-3 text-base font-bold transition ${
    isActive
      ? "bg-white/10 text-boteco-ink"
      : "text-boteco-muted hover:text-boteco-ink hover:bg-white/5"
  }`;
}

/** Capa-placeholder colorida com a inicial da playlist. */
function PlaylistThumb({ name }: { name: string }) {
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-gradient-to-br from-boteco-blue-bright to-boteco-green text-xl font-display text-white">
      {name.trim().charAt(0).toUpperCase() || "♪"}
    </div>
  );
}

export function Sidebar() {
  const isCurator = useIsCurator();
  const isAdmin = useIsAdmin();
  const { data: followed = [] } = useQuery({
    queryKey: ["followed"],
    queryFn: fetchFollowedPlaylists,
  });

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-3 md:flex lg:w-80">
      {/* navegação fixa */}
      <nav className="boteco-pattern-faint rounded-xl bg-boteco-panel p-3">
        <NavLink to="/" end className={navClass}>
          <HomeIcon size={26} /> Início
        </NavLink>
        <NavLink to="/playlists" className={navClass}>
          <PlaylistIcon size={26} /> Playlists
        </NavLink>
        <NavLink to="/perfil" className={navClass}>
          <UserIcon size={26} /> Perfil
        </NavLink>
        {isCurator && (
          <NavLink to="/enviar" className={navClass}>
            <UploadIcon size={26} /> Enviar faixa
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/moderacao" className={navClass}>
            <ShieldIcon size={26} /> Moderação
          </NavLink>
        )}
      </nav>

      {/* biblioteca (playlists seguidas) */}
      <div className="boteco-pattern-faint flex min-h-0 flex-1 flex-col rounded-xl bg-boteco-panel">
        <div className="flex items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 text-base font-bold text-boteco-muted">
            <PlaylistIcon size={24} /> Sua Biblioteca
          </span>
          {isCurator && (
            <Link
              to="/playlists"
              title="Criar playlist"
              className="grid h-10 w-10 place-items-center rounded-full text-boteco-muted transition hover:bg-white/10 hover:text-boteco-ink"
            >
              <PlusIcon size={22} />
            </Link>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {followed.length === 0 ? (
            <div className="m-2 rounded-lg bg-white/5 p-4 text-base text-boteco-muted">
              <p className="text-lg font-bold text-boteco-ink">Siga playlists do boteco</p>
              <p className="mt-1">As que você seguir aparecem aqui pra acesso rápido. 🍻</p>
              <Link
                to="/playlists"
                className="mt-4 inline-flex rounded-full bg-boteco-ink px-4 py-2 text-sm font-bold text-boteco-base transition hover:scale-105"
              >
                Explorar playlists
              </Link>
            </div>
          ) : (
            followed.map((p) => (
              <Link
                key={p.id}
                to={`/playlists/${p.id}`}
                className="flex items-center gap-3 rounded-md p-2.5 transition hover:bg-white/10"
              >
                <PlaylistThumb name={p.name} />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-boteco-ink">{p.name}</p>
                  <p className="truncate text-sm text-boteco-muted">
                    Playlist • {p.trackCount} faixas
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
