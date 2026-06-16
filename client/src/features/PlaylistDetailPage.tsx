import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlaylist, toggleFollow, toggleLike } from "../lib/queries";
import { RhythmBadge } from "../components/RhythmBadge";
import { usePlayerStore } from "../store/playerStore";
import type { Rhythm, Track } from "../types";
import { HeartIcon, MusicIcon, PlayIcon } from "../components/icons";

const HERO_BY_RHYTHM: Record<Rhythm, string> = {
  pagode: "#0B8A3D",
  sertanejo: "#E0A500",
  arrocha: "#DA2D1F",
  brega: "#2949D6",
};

function fmtDur(sec: number) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TrackRow({ track, index, queue }: { track: Track; index: number; queue: Track[] }) {
  const playQueue = usePlayerStore((s) => s.playQueue);
  const updateCounters = usePlayerStore((s) => s.updateTrackCounters);
  const qc = useQueryClient();

  const like = useMutation({
    mutationFn: () => toggleLike(track.id),
    onSuccess: (res) => {
      updateCounters(track.id, { liked: res.liked, likesCount: res.likesCount });
      qc.invalidateQueries({ queryKey: ["playlist"] });
    },
  });

  return (
    <div className="group grid grid-cols-[28px_1fr_auto] items-center gap-4 rounded-md px-4 py-3 transition hover:bg-white/10 sm:grid-cols-[28px_4fr_2fr_auto]">
      <button
        onClick={() => playQueue(queue, index)}
        className="grid h-8 w-8 place-items-center text-base text-boteco-muted"
        title={`Tocar ${track.title}`}
      >
        <span className="group-hover:hidden">{index + 1}</span>
        <span className="hidden text-boteco-ink group-hover:block">
          <PlayIcon size={20} />
        </span>
      </button>

      <div className="flex min-w-0 items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded bg-gradient-to-br from-boteco-blue-bright/50 to-boteco-green/30">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <MusicIcon size={22} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-boteco-ink">{track.title}</p>
          <p className="truncate text-base text-boteco-muted">{track.artist}</p>
        </div>
      </div>

      <div className="hidden items-center sm:flex">
        <RhythmBadge rhythm={track.rhythm} />
      </div>

      <div className="flex items-center justify-end gap-4 text-base text-boteco-muted">
        <button
          onClick={() => like.mutate()}
          disabled={like.isPending}
          title="Curtir"
          className={`transition hover:scale-110 ${
            track.liked ? "text-boteco-red-light" : "text-boteco-muted opacity-0 group-hover:opacity-100 hover:text-boteco-ink"
          }`}
        >
          <HeartIcon size={20} filled={track.liked} />
        </button>
        <span className="inline-flex items-center gap-1.5">
          <PlayIcon size={14} /> <span data-plays={track.id}>{track.playsCount}</span>
        </span>
        <span className="hidden w-12 text-right tabular-nums sm:inline">
          {fmtDur(track.durationSec)}
        </span>
      </div>
    </div>
  );
}

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followed"] });
      qc.invalidateQueries({ queryKey: ["playlist", id] });
    },
  });

  if (isLoading) return <p className="p-6 text-boteco-muted">Carregando playlist…</p>;
  if (!playlist) return <p className="p-6 text-boteco-muted">Playlist não encontrada.</p>;

  const tracks = playlist.tracks ?? [];
  const hero = HERO_BY_RHYTHM[playlist.rhythms[0]] ?? "#2949D6";

  return (
    <div>
      {/* cabeçalho estilo capa de playlist */}
      <header className="page-hero px-6 pb-8 pt-12 sm:px-10" style={{ ["--hero" as string]: hero }}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div
            className="grid h-52 w-52 shrink-0 place-items-center rounded-xl shadow-2xl shadow-black/40 sm:h-60 sm:w-60"
            style={{ background: `linear-gradient(135deg, ${hero}, #0B8A3D)` }}
          >
            <span className="font-display text-8xl text-white/90 drop-shadow">
              {playlist.name.trim().charAt(0).toUpperCase() || <MusicIcon size={80} />}
            </span>
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-base font-bold uppercase tracking-wide text-boteco-ink/80">Playlist</p>
            <h1 className="font-display text-5xl text-boteco-ink sm:text-7xl">{playlist.name}</h1>
            {playlist.description && (
              <p className="mt-3 text-lg text-boteco-muted">{playlist.description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {playlist.rhythms.map((r) => (
                <RhythmBadge key={r} rhythm={r} />
              ))}
              <span className="ml-2 text-base text-boteco-muted">• {playlist.trackCount} faixas</span>
            </div>
          </div>
        </div>
      </header>

      {/* ações */}
      <div className="flex items-center gap-5 px-6 py-6 sm:px-10">
        <button
          onClick={() => playQueue(tracks, 0)}
          disabled={tracks.length === 0}
          title="Tocar tudo"
          className="grid h-16 w-16 place-items-center rounded-full bg-boteco-green text-white shadow-lg shadow-black/30 transition hover:scale-105 hover:bg-boteco-green-light hover:text-boteco-base disabled:opacity-40"
        >
          <PlayIcon size={34} />
        </button>
        <button className="btn-ghost" onClick={() => follow.mutate()} disabled={follow.isPending}>
          {follow.data?.following ? "Seguindo ✓" : "Seguir playlist"}
        </button>
      </div>

      {/* lista de faixas */}
      <div className="px-4 pb-12 sm:px-10">
        {tracks.length === 0 ? (
          <p className="text-lg text-boteco-muted">Esta playlist ainda não tem faixas.</p>
        ) : (
          <>
            <div className="grid grid-cols-[28px_1fr_auto] gap-4 border-b border-white/10 px-4 pb-3 text-sm uppercase tracking-wide text-boteco-muted sm:grid-cols-[28px_4fr_2fr_auto]">
              <span>#</span>
              <span>Título</span>
              <span className="hidden sm:block">Ritmo</span>
              <span className="text-right">Tocadas / Duração</span>
            </div>
            <div className="mt-2">
              {tracks.map((t, i) => (
                <TrackRow key={t.id} track={t} index={i} queue={tracks} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
