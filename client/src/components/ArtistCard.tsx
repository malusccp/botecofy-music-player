import { Link } from "react-router-dom";
import type { Artist } from "../types";
import { MusicIcon } from "./icons";

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link to={`/artist/${artist.id}`} className="w-36 shrink-0 space-y-3 text-center sm:w-40">
      <div className="mx-auto grid aspect-square w-full place-items-center overflow-hidden rounded-full bg-gradient-to-br from-boteco-blue-bright to-boteco-green">
        {artist.photoUrl ? (
          <img src={artist.photoUrl} alt={artist.name} className="h-full w-full object-cover" />
        ) : artist.name.trim() ? (
          <span className="font-display text-4xl text-white/90 drop-shadow">
            {artist.name.trim().charAt(0).toUpperCase()}
          </span>
        ) : (
          <MusicIcon size={32} />
        )}
      </div>
      <h3 className="truncate text-base font-bold text-boteco-ink">{artist.name}</h3>
    </Link>
  );
}
