import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlaylist, toggleFollow } from "../lib/queries";
import { TrackCard } from "../components/TrackCard";
import { RhythmBadge } from "../components/RhythmBadge";
import { usePlayerStore } from "../store/playerStore";

export function PlaylistDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const { data: playlist, isLoading } = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => fetchPlaylist(id),
    enabled: !!id,
  });

  const follow = useMutation({
    mutationFn: () => toggleFollow(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followed"] }),
  });

  if (isLoading) return <p className="text-boteco-cream/60">Carregando playlist…</p>;
  if (!playlist) return <p className="text-boteco-cream/60">Playlist não encontrada.</p>;

  const tracks = playlist.tracks ?? [];

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h1 className="font-display text-3xl text-boteco-amber">{playlist.name}</h1>
        <p className="text-boteco-cream/70 mt-1">{playlist.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {playlist.rhythms.map((r) => (
            <RhythmBadge key={r} rhythm={r} />
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            className="btn-primary"
            disabled={tracks.length === 0}
            onClick={() => playQueue(tracks, 0)}
          >
            ▶ Tocar tudo
          </button>
          <button className="btn-ghost" onClick={() => follow.mutate()} disabled={follow.isPending}>
            {follow.data?.following ? "Seguindo ✓" : "Seguir playlist"}
          </button>
        </div>
      </div>

      {tracks.length === 0 ? (
        <p className="text-boteco-cream/60">Esta playlist ainda não tem faixas.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tracks.map((t) => (
            <TrackCard key={t.id} track={t} queue={tracks} />
          ))}
        </div>
      )}
    </section>
  );
}
