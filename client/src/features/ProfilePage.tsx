import { useQuery } from "@tanstack/react-query";
import { fetchFollowedPlaylists, fetchHistory, fetchMe } from "../lib/queries";
import { Link } from "react-router-dom";
import { TrackCard } from "../components/TrackCard";

export function ProfilePage() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { data: history } = useQuery({ queryKey: ["history"], queryFn: fetchHistory });
  const { data: followed = [] } = useQuery({ queryKey: ["followed"], queryFn: fetchFollowedPlaylists });

  const ROLE = { listener: "Ouvinte", curator: "Curador", admin: "Administrador" } as const;
  const recent = history?.items ?? [];

  return (
    <section className="space-y-8">
      <div className="card p-6">
        <h1 className="font-display text-3xl text-boteco-amber">{me?.displayName ?? "Perfil"}</h1>
        <p className="text-boteco-cream/60">Perfil: {me ? ROLE[me.role] : "—"}</p>
      </div>

      <div>
        <h2 className="font-semibold text-xl mb-3">Playlists que você segue</h2>
        {followed.length === 0 ? (
          <p className="text-boteco-cream/60">Você ainda não segue nenhuma playlist.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {followed.map((p) => (
              <Link key={p.id} to={`/playlists/${p.id}`} className="card p-4 hover:border-boteco-amber/40">
                <h3 className="font-semibold">{p.name}</h3>
                <span className="text-xs text-boteco-cream/50">{p.trackCount} faixas</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-xl mb-3">Tocadas recentemente</h2>
        {recent.length === 0 ? (
          <p className="text-boteco-cream/60">Seu histórico aparece aqui depois que você ouvir algo.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.map((t, i) => (
              <TrackCard key={`${t.id}-${i}`} track={t} queue={recent} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
