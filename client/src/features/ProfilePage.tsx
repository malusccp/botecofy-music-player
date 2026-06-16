import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchFollowedPlaylists, fetchHistory } from "../lib/queries";
import { useMe } from "../auth/useMe";
import { TrackCard } from "../components/TrackCard";
import { PlaylistIcon } from "../components/icons";

const ROLE = { listener: "Ouvinte", curator: "Curador", admin: "Administrador" } as const;

export function ProfilePage() {
  const { data: me } = useMe();
  const { data: history } = useQuery({ queryKey: ["history"], queryFn: fetchHistory });
  const { data: followed = [] } = useQuery({
    queryKey: ["followed"],
    queryFn: fetchFollowedPlaylists,
  });

  const recent = history?.items ?? [];
  const initial = (me?.displayName ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div>
      {/* cabeçalho do perfil */}
      <header
        className="page-hero flex flex-col items-center gap-7 px-6 pb-10 pt-14 sm:flex-row sm:items-end sm:px-10"
        style={{ ["--hero" as string]: "#16276E" }}
      >
        <div className="grid h-48 w-48 place-items-center rounded-full bg-gradient-to-br from-boteco-blue-bright to-boteco-green font-display text-8xl text-white shadow-2xl shadow-black/40">
          {initial}
        </div>
        <div className="text-center sm:text-left">
          <p className="text-base font-bold uppercase tracking-wide text-boteco-ink/80">Perfil</p>
          <h1 className="font-display text-5xl text-boteco-ink sm:text-7xl">
            {me?.displayName ?? "Perfil"}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-base text-boteco-muted sm:justify-start">
            <span className="chip border-boteco-yellow/40 bg-boteco-yellow/15 px-4 py-1.5 text-sm text-boteco-yellow">
              {me ? ROLE[me.role] : "—"}
            </span>
            <span>• {followed.length} playlists seguidas</span>
            <span>• {recent.length} faixas no histórico</span>
          </div>
        </div>
      </header>

      <div className="space-y-12 px-6 pb-12 sm:px-10">
        <section>
          <h2 className="mb-5 flex items-center gap-3 font-display text-3xl text-boteco-ink">
            <PlaylistIcon size={28} /> Playlists que você segue
          </h2>
          {followed.length === 0 ? (
            <p className="text-lg text-boteco-muted">Você ainda não segue nenhuma playlist.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {followed.map((p) => (
                <Link
                  key={p.id}
                  to={`/playlists/${p.id}`}
                  className="group flex flex-col gap-4 rounded-2xl bg-boteco-card p-5 transition hover:bg-boteco-card-hover"
                >
                  <div className="grid aspect-square w-full place-items-center rounded-xl bg-gradient-to-br from-boteco-blue-bright to-boteco-green font-display text-6xl text-white/90">
                    {p.name.trim().charAt(0).toUpperCase() || "♪"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-boteco-ink">{p.name}</h3>
                    <p className="text-sm text-boteco-muted">{p.trackCount} faixas</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 font-display text-3xl text-boteco-ink">Tocadas recentemente</h2>
          {recent.length === 0 ? (
            <p className="text-lg text-boteco-muted">
              Seu histórico aparece aqui depois que você ouvir algo.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {recent.map((t, i) => (
                <TrackCard key={`${t.id}-${i}`} track={t} queue={recent} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
