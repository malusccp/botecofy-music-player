import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAlbum } from "../lib/queries";
import { usePlayerStore } from "../store/playerStore";
import { TrackTile } from "../components/TrackTile";
import { MusicIcon, PlayIcon } from "../components/icons";

export function AlbumPage() {
  const { id = "" } = useParams();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const { data, isLoading } = useQuery({
    queryKey: ["album", id],
    queryFn: () => fetchAlbum(id),
    enabled: !!id,
  });

  if (isLoading) return <p className="p-6 text-boteco-muted">Carregando álbum…</p>;
  if (!data) return <p className="p-6 text-boteco-muted">Álbum não encontrado.</p>;

  const { album, tracks } = data;
  const artist = typeof album.artist === "string" ? null : album.artist;
  const playAll = () => tracks.length && playQueue(tracks, 0);

  return (
    <div>
      <header className="page-hero px-6 pb-8 pt-12 sm:px-10" style={{ ["--hero" as string]: "#1E6F3C" }}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="grid h-48 w-48 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-boteco-blue-bright/40 to-boteco-green/20 shadow-2xl shadow-black/40 sm:h-56 sm:w-56">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
            ) : (
              <MusicIcon size={72} />
            )}
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-base font-bold uppercase tracking-wide text-boteco-ink/80">Álbum</p>
            <h1 className="font-display text-4xl text-boteco-ink sm:text-6xl">{album.title}</h1>
            {artist && (
              <Link to={`/artist/${artist.id}`} className="mt-1 inline-block text-lg text-boteco-ink/80 hover:underline">
                {artist.name}
              </Link>
            )}
            <p className="mt-1 text-base text-boteco-ink/70">{tracks.length} faixas</p>
            <button
              onClick={playAll}
              disabled={tracks.length === 0}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-boteco-green px-7 py-3 text-lg font-bold text-white shadow-lg shadow-black/30 transition hover:scale-105 hover:bg-boteco-green-light hover:text-boteco-base disabled:opacity-50"
            >
              <PlayIcon size={22} /> Tocar tudo
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 pb-12 sm:px-10">
        {tracks.length === 0 ? (
          <p className="text-lg text-boteco-muted">Este álbum ainda não tem faixas disponíveis.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {tracks.map((t) => (
              <TrackTile key={t.id} track={t} queue={tracks} className="w-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
