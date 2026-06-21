import type { Track } from "../types";
import { usePlayerStore } from "../store/playerStore";
import { MusicIcon, PlayIcon } from "./icons";

interface Props {
  track: Track;
  queue?: Track[];
  /** Largura/posicionamento. Padrão = carrossel; passe "w-full" para usar em grid. */
  className?: string;
}

/**
 * Cartão compacto de faixa, no mesmo tamanho dos cartões de álbum
 * ("Recomendações de Álbuns"). Toca a faixa (dentro da fila informada) no hover.
 */
export function TrackTile({ track, queue, className = "w-44 shrink-0 sm:w-52" }: Props) {
  const playQueue = usePlayerStore((s) => s.playQueue);

  const play = () => {
    const list = queue && queue.length ? queue : [track];
    const startIndex = Math.max(0, list.findIndex((t) => t.id === track.id));
    playQueue(list, startIndex);
  };

  return (
    <div
      className={`group space-y-3 rounded-2xl bg-boteco-card p-4 transition hover:bg-boteco-card-hover ${className}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-boteco-blue-bright/40 to-boteco-green/20">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-boteco-ink/40">
            <MusicIcon size={40} />
          </div>
        )}

        <button
          onClick={play}
          title={`Tocar ${track.title}`}
          className="absolute bottom-2 right-2 grid h-12 w-12 translate-y-3 place-items-center rounded-full
            bg-boteco-green text-white opacity-0 shadow-xl shadow-black/40 transition-all duration-200
            hover:scale-105 hover:bg-boteco-green-light hover:text-boteco-base
            group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          <PlayIcon size={22} />
        </button>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-base font-bold text-boteco-ink">{track.title}</h3>
        <p className="truncate text-sm text-boteco-muted">{track.artist}</p>
      </div>
    </div>
  );
}
