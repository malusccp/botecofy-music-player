import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Track } from "../types";
import { RhythmBadge } from "./RhythmBadge";
import { usePlayerStore } from "../store/playerStore";
import { toggleLike } from "../lib/queries";
import { HeartIcon, MusicIcon, PlayIcon } from "./icons";

interface Props {
  track: Track;
  queue?: Track[];
  /** Slot extra de ação (ex.: adicionar à playlist, moderar). */
  action?: React.ReactNode;
}

export function TrackCard({ track, queue, action }: Props) {
  const playQueue = usePlayerStore((s) => s.playQueue);
  const updateCounters = usePlayerStore((s) => s.updateTrackCounters);
  const qc = useQueryClient();

  const like = useMutation({
    mutationFn: () => toggleLike(track.id),
    onSuccess: (res) => {
      updateCounters(track.id, { liked: res.liked, likesCount: res.likesCount });
      qc.invalidateQueries({ queryKey: ["tracks"] });
    },
  });

  const play = () => {
    const list = queue && queue.length ? queue : [track];
    const startIndex = Math.max(0, list.findIndex((t) => t.id === track.id));
    playQueue(list, startIndex);
  };

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl bg-boteco-card p-5 transition hover:bg-boteco-card-hover">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-boteco-blue-bright/40 to-boteco-green/20">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-boteco-ink/40">
            <MusicIcon size={60} />
          </div>
        )}

        {/* botão de play que sobe no hover (estilo player de música) */}
        <button
          onClick={play}
          title={`Tocar ${track.title}`}
          className="absolute bottom-3 right-3 grid h-16 w-16 translate-y-3 place-items-center rounded-full
            bg-boteco-green text-white opacity-0 shadow-xl shadow-black/40 transition-all duration-200
            hover:scale-105 hover:bg-boteco-green-light hover:text-boteco-base
            group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          <PlayIcon size={30} />
        </button>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-lg font-bold leading-tight text-boteco-ink">{track.title}</h3>
        <p className="truncate text-base text-boteco-muted">{track.artist}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <RhythmBadge rhythm={track.rhythm} />
        <div className="flex items-center gap-4 text-sm text-boteco-muted">
          <span className="inline-flex items-center gap-1.5">
            <PlayIcon size={14} /> <span data-plays={track.id}>{track.playsCount}</span>
          </span>
          <button
            onClick={() => like.mutate()}
            disabled={like.isPending}
            title="Curtir"
            className={`inline-flex items-center gap-1.5 transition hover:scale-110 ${
              track.liked ? "text-boteco-red-light" : "text-boteco-muted hover:text-boteco-ink"
            }`}
          >
            <HeartIcon size={18} filled={track.liked} />
            <span data-likes={track.id}>{track.likesCount}</span>
          </button>
        </div>
      </div>

      {action}
    </div>
  );
}
