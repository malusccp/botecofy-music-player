import { Link } from "react-router-dom";
import type { Playlist } from "../types";
import { RhythmBadge } from "./RhythmBadge";
import { MusicIcon } from "./icons";

function PlaylistCover({ name }: { name: string }) {
  return (
    <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-boteco-blue-bright to-boteco-green">
      <span className="font-display text-6xl text-white/90 drop-shadow">
        {name.trim().charAt(0).toUpperCase() || <MusicIcon size={56} />}
      </span>
    </div>
  );
}

interface Props {
  playlist: Playlist;
  className?: string;
}

export function PlaylistCard({ playlist, className = "" }: Props) {
  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className={`group flex flex-col gap-4 rounded-2xl bg-boteco-card p-5 transition hover:bg-boteco-card-hover ${className}`}
    >
      <PlaylistCover name={playlist.name} />
      <div className="min-w-0">
        <h3 className="truncate text-lg font-bold text-boteco-ink">{playlist.name}</h3>
        <p className="line-clamp-2 text-base text-boteco-muted">
          {playlist.description || "Sem descrição"}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {playlist.rhythms.map((r) => (
          <RhythmBadge key={r} rhythm={r} />
        ))}
      </div>
      <span className="text-sm text-boteco-muted">{playlist.trackCount} faixas</span>
    </Link>
  );
}
