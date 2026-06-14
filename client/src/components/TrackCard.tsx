import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Track } from "../types";
import { RhythmBadge } from "./RhythmBadge";
import { usePlayerStore } from "../store/playerStore";
import { toggleLike } from "../lib/queries";

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
    <div className="card p-4 flex flex-col gap-3">
      <div className="aspect-square rounded-lg bg-gradient-to-br from-boteco-ember/40 to-boteco-surface grid place-items-center overflow-hidden">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🎵</span>
        )}
      </div>

      <div>
        <h3 className="font-semibold leading-tight">{track.title}</h3>
        <p className="text-sm text-boteco-cream/60">{track.artist}</p>
      </div>

      <div className="flex items-center justify-between">
        <RhythmBadge rhythm={track.rhythm} />
        <span className="text-xs text-boteco-cream/50" data-plays={track.id}>
          ▶ {track.playsCount}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-primary flex-1" onClick={play}>
          ▶ Tocar
        </button>
        <button
          className={`btn-ghost ${track.liked ? "text-rose-400 border-rose-400/40" : ""}`}
          onClick={() => like.mutate()}
          disabled={like.isPending}
          title="Curtir"
        >
          {track.liked ? "♥" : "♡"} <span data-likes={track.id}>{track.likesCount}</span>
        </button>
      </div>

      {action}
    </div>
  );
}
