import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchArtistProfile } from "../lib/queries";
import { TrackTile } from "../components/TrackTile";
import { AlbumCard } from "../components/AlbumCard";
import { MusicIcon } from "../components/icons";

export function ArtistPage() {
  const { id = "" } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => fetchArtistProfile(id),
    enabled: !!id,
  });

  if (isLoading) return <p className="p-6 text-boteco-muted">Carregando artista…</p>;
  if (!data) return <p className="p-6 text-boteco-muted">Artista não encontrado.</p>;

  const { artist, albums, topTracks } = data;

  return (
    <div>
      <header className="page-hero px-6 pb-8 pt-12 sm:px-10" style={{ ["--hero" as string]: "#2949D6" }}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="grid h-52 w-52 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-boteco-blue-bright to-boteco-green shadow-2xl shadow-black/40 sm:h-60 sm:w-60">
            {artist.photoUrl ? (
              <img src={artist.photoUrl} alt={artist.name} className="h-full w-full object-cover" />
            ) : artist.name.trim() ? (
              <span className="font-display text-8xl text-white/90 drop-shadow">
                {artist.name.trim().charAt(0).toUpperCase()}
              </span>
            ) : (
              <MusicIcon size={80} />
            )}
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-base font-bold uppercase tracking-wide text-boteco-ink/80">Artista</p>
            <h1 className="font-display text-5xl text-boteco-ink sm:text-7xl">{artist.name}</h1>
          </div>
        </div>
      </header>

      <div className="space-y-10 px-6 pb-12 sm:px-10">
        {albums.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl text-boteco-ink sm:text-3xl">Álbuns</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {albums.map((a) => (
                <AlbumCard key={a.id} album={a} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-boteco-ink sm:text-3xl">Faixas mais populares</h2>
          {topTracks.length === 0 ? (
            <p className="text-lg text-boteco-muted">Ainda não há faixas para este artista.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {topTracks.map((t) => (
                <TrackTile key={t.id} track={t} queue={topTracks} className="w-full" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
