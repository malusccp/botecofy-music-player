import { useState } from "react";
import { Link } from "react-router-dom";
import type { Album } from "../types";
import { usePlayerStore } from "../store/playerStore";
import { fetchAlbum } from "../lib/queries";
import { MusicIcon, PlayIcon } from "./icons";

export function AlbumCard({ album }: { album: Album }) {
  const artist = typeof album.artist === "string" ? null : album.artist;
  const playQueue = usePlayerStore((s) => s.playQueue);
  const [loading, setLoading] = useState(false);

  // Clica no botão de play → carrega as faixas do álbum e toca todas em sequência.
  const playAlbum = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const { tracks } = await fetchAlbum(album.id);
      if (tracks.length) playQueue(tracks, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/album/${album.id}`}
      className="group block w-44 shrink-0 space-y-3 rounded-2xl bg-boteco-card p-4 transition hover:bg-boteco-card-hover sm:w-52"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-boteco-blue-bright/40 to-boteco-green/20">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-boteco-ink/40">
            <MusicIcon size={40} />
          </div>
        )}

        <button
          onClick={playAlbum}
          title={`Tocar o álbum ${album.title}`}
          className="absolute bottom-2 right-2 grid h-12 w-12 translate-y-3 place-items-center rounded-full
            bg-boteco-green text-white opacity-0 shadow-xl shadow-black/40 transition-all duration-200
            hover:scale-105 hover:bg-boteco-green-light hover:text-boteco-base
            group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100
            disabled:opacity-60"
          disabled={loading}
        >
          <PlayIcon size={22} />
        </button>
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-base font-bold text-boteco-ink">{album.title}</h3>
        {artist && <span className="block truncate text-sm text-boteco-muted">{artist.name}</span>}
      </div>
    </Link>
  );
}
